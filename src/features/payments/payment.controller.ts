import { Controller, Get, Param, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentService } from './payment.service';
import { CreatePaymentOrderDto } from './payment.dto';

@Controller('api')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('plans')
  getPlans() { return this.paymentService.listPlans(); }

  @Post('payment-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1')
  createOrder(@Req() req: any, @Body() dto: CreatePaymentOrderDto) {
    const ip = String(req.ip ?? req.headers?.['x-forwarded-for'] ?? '127.0.0.1').split(',')[0].trim();
    return this.paymentService.createPaymentOrder(req.user.userId, dto, ip);
  }

  @Get('payment-orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1')
  getOrder(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.getPaymentOrder(id, req.user.userId, String(req.user.role) === '0');
  }

  @Get('admin/payment-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0')
  getAllOrders() {
    return this.paymentService.listPaymentOrders();
  }

  @Get('recruiter/payment-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1')
  getMyOrders(@Req() req: any) {
    return this.paymentService.listPaymentOrders(req.user.userId);
  }

  @Get('payments/vnpay/return')
  vnpayReturn(@Query() query: Record<string, string>) {
    return { responseCode: query.vnp_ResponseCode ?? null, txnRef: query.vnp_TxnRef ?? null };
  }

  @Get('payments/vnpay/ipn')
  vnpayIpn(@Query() query: Record<string, string>) { return this.paymentService.processVnpayIpn(query); }

  @Get('credits/balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1')
  getBalance(@Req() req: any) { return this.paymentService.getBalance(req.user.userId); }

  @Get('credits/ledger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1')
  getLedger(@Req() req: any) { return this.paymentService.getLedger(req.user.userId); }
}
