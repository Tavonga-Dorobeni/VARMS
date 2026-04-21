import { PaymentType, StrSeverity } from '@prisma/client';

export interface SaleRiskContext {
  saleId: number;
  vehicleId: number;
  dealershipId: number;
  buyerId: number;
  paymentType: PaymentType;
  salePrice: number;
  declaredValue: number;
  saleDate: Date;
  buyerPurchaseCountInWindow: number;
  dealershipCashSaleCountInWindow: number;
  isRapidResale: boolean;
}

export interface StrRuleResult {
  alertType: string;
  reason: string;
  severity: StrSeverity;
  transactionValue?: number;
}
