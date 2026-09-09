import { IsUUID } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsUUID()
  planId: string;
}

export class PlanEntitlementDto {
  creditType: string;
  quantity: number;
  expiresInDays?: number;
}

export class ServicePlanDto {
  id: string;
  name: string;
  price: number;
  currency: string;
  entitlements: PlanEntitlementDto[];
}

export class PaymentOrderDto {
  id: string;
  planId: string;
  vnpTxnRef: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date;
  paymentUrl?: string;
}

export class CreditLedgerDto {
  id: string;
  creditType: string;
  quantity: number;
  expiresAt?: Date;
  createdAt: Date;
  paymentOrderId?: string;
}

export class CreditBalanceDto {
  balances: Record<string, number>;
}
