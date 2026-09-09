import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreditBalanceDto,
  CreditLedgerDto,
  CreatePaymentOrderDto,
  PaymentOrderDto,
  ServicePlanDto,
} from './payment.dto';
import {
  formatVnpayDate,
  signVnpay,
  VnpayParams,
  verifyVnpay,
} from './vnpay.util';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlans(): Promise<ServicePlanDto[]> {
    const plans = await this.prisma.servicePlan.findMany({
      where: { isActive: true },
      include: { entitlements: true },
      orderBy: { price: 'asc' },
    });
    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: Number(plan.price),
      currency: plan.currency,
      entitlements: plan.entitlements.map((item) => ({
        creditType: item.creditType,
        quantity: item.quantity,
        expiresInDays: item.expiresInDays ?? undefined,
      })),
    }));
  }

  async createPaymentOrder(
    userId: string,
    dto: CreatePaymentOrderDto,
    ipAddress: string,
  ): Promise<PaymentOrderDto> {
    const plan = await this.prisma.servicePlan.findFirst({
      where: { id: dto.planId, isActive: true },
      include: { entitlements: true },
    });
    if (!plan) throw new NotFoundException('Không tìm thấy gói dịch vụ đang hoạt động.');
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secret = process.env.VNPAY_HASH_SECRET;
    if (!tmnCode || !secret) {
      throw new BadRequestException('VNPAY sandbox chưa được cấu hình.');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    const order = await this.prisma.paymentOrder.create({
      data: {
        userId,
        planId: plan.id,
        vnpTxnRef: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        amount: plan.price,
        currency: plan.currency,
        expiresAt,
      },
    });
    return {
      ...this.toOrderDto(order),
      paymentUrl: this.buildPaymentUrl(order, tmnCode, secret, ipAddress),
    };
  }

  async getPaymentOrder(id: string, userId: string, isAdmin: boolean): Promise<PaymentOrderDto> {
    const order = await this.prisma.paymentOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn thanh toán.');
    if (!isAdmin && order.userId !== userId) throw new ForbiddenException('Bạn không có quyền xem đơn này.');
    return this.toOrderDto(order);
  }

  async processVnpayIpn(query: Record<string, string>): Promise<{ RspCode: string; Message: string }> {
    const secret = process.env.VNPAY_HASH_SECRET;
    if (!secret) return { RspCode: '99', Message: 'Chưa cấu hình VNPAY' };
    const params = this.normalizeQuery(query);
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    if (!verifyVnpay(params, secureHash, secret)) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }
    const txnRef = params.vnp_TxnRef;
    const order = await this.prisma.paymentOrder.findUnique({ where: { vnpTxnRef: txnRef } });
    if (!order) return { RspCode: '01', Message: 'Order not found' };
    const amount = Number(params.vnp_Amount) / 100;
    if (!Number.isFinite(amount) || Math.round(amount * 100) !== Math.round(Number(order.amount) * 100)) {
      return { RspCode: '04', Message: 'Invalid amount' };
    }
    if (order.status === 'Paid') return { RspCode: '00', Message: 'Confirm Success' };
    if (order.status !== 'Pending') return { RspCode: '02', Message: 'Order already processed' };

    const responseCode = params.vnp_ResponseCode;
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.paymentOrder.findUnique({
        where: { id: order.id },
        include: { plan: { include: { entitlements: true } } },
      });
      if (!current || current.status === 'Paid') return;
      if (responseCode === '00' && current.expiresAt > new Date()) {
        await tx.paymentOrder.update({
          where: { id: current.id },
          data: { status: 'Paid', paidAt: new Date(), providerResponseCode: responseCode },
        });
        await tx.creditLedger.createMany({
          data: current.plan.entitlements.map((item) => ({
            userId: current.userId,
            paymentOrderId: current.id,
            creditType: item.creditType,
            quantity: item.quantity,
            expiresAt: item.expiresInDays ? new Date(Date.now() + item.expiresInDays * 86400000) : null,
          })),
          skipDuplicates: true,
        });
      } else {
        await tx.paymentOrder.update({
          where: { id: current.id },
          data: {
            status: current.expiresAt <= new Date() ? 'Expired' : 'Failed',
            providerResponseCode: responseCode,
          },
        });
      }
    });
    return responseCode === '00'
      ? { RspCode: '00', Message: 'Confirm Success' }
      : { RspCode: '00', Message: 'Confirm Success' };
  }

  async getBalance(userId: string): Promise<CreditBalanceDto> {
    const entries = await this.prisma.creditLedger.findMany({
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    });
    const balances: Record<string, number> = {};
    for (const entry of entries) balances[entry.creditType] = (balances[entry.creditType] ?? 0) + entry.quantity;
    return { balances };
  }

  async getLedger(userId: string): Promise<CreditLedgerDto[]> {
    const entries = await this.prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return entries.map((entry) => ({
      id: entry.id,
      creditType: entry.creditType,
      quantity: entry.quantity,
      expiresAt: entry.expiresAt ?? undefined,
      createdAt: entry.createdAt,
      paymentOrderId: entry.paymentOrderId ?? undefined,
    }));
  }

  private buildPaymentUrl(
    order: { vnpTxnRef: string; amount: Prisma.Decimal; createdAt: Date; expiresAt: Date },
    tmnCode: string,
    secret: string,
    ipAddress: string,
  ): string {
    const params: VnpayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(Math.round(Number(order.amount) * 100)),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: order.vnpTxnRef,
      vnp_OrderInfo: `Thanh toan goi dich vu ${order.vnpTxnRef}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL ?? 'http://localhost:3000/vi/payment/return',
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_CreateDate: formatVnpayDate(order.createdAt),
      vnp_ExpireDate: formatVnpayDate(order.expiresAt),
    };
    const signature = signVnpay(params, secret);
    const query = Object.keys(params).sort().map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`).join('&');
    return `${process.env.VNPAY_PAYMENT_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'}?${query}&vnp_SecureHash=${signature}`;
  }

  private normalizeQuery(query: Record<string, string>): VnpayParams {
    return Object.fromEntries(Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)]));
  }

  private toOrderDto(order: { id: string; planId: string; vnpTxnRef: string; amount: Prisma.Decimal; currency: string; status: string; createdAt: Date; expiresAt: Date; paidAt: Date | null }): PaymentOrderDto {
    return {
      id: order.id,
      planId: order.planId,
      vnpTxnRef: order.vnpTxnRef,
      amount: Number(order.amount),
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
      paidAt: order.paidAt ?? undefined,
    };
  }
}
