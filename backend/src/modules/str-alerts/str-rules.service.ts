import { Injectable } from '@nestjs/common';
import { StrSeverity } from '@prisma/client';
import { AppConfigService } from '../../config/app-config.service';
import { SaleRiskContext, StrRuleResult } from './interfaces/str-rule.interface';

@Injectable()
export class StrRulesService {
  constructor(private readonly appConfigService: AppConfigService) {}

  evaluate(context: SaleRiskContext): StrRuleResult[] {
    return [
      this.cashThresholdRule(context),
      this.priceDisparityRule(context),
      this.nomineePatternRule(context),
      this.rapidResaleRule(context),
      this.highCashVolumeRule(context),
    ].filter((result): result is StrRuleResult => Boolean(result));
  }

  private cashThresholdRule(context: SaleRiskContext): StrRuleResult | null {
    if (
      context.paymentType === 'CASH' &&
      context.salePrice > this.appConfigService.strCashThreshold
    ) {
      return {
        alertType: 'CASH_THRESHOLD',
        reason: `Cash sale exceeds threshold of ${this.appConfigService.strCashThreshold}`,
        severity: StrSeverity.HIGH,
        transactionValue: context.salePrice,
      };
    }
    return null;
  }

  private priceDisparityRule(context: SaleRiskContext): StrRuleResult | null {
    const disparityPercent =
      ((context.salePrice - context.declaredValue) / context.declaredValue) * 100;
    if (Math.abs(disparityPercent) >= this.appConfigService.priceDisparityPercent) {
      return {
        alertType: 'PRICE_DISPARITY',
        reason: `Sale price differs from declared value by ${disparityPercent.toFixed(2)}%`,
        severity: StrSeverity.MEDIUM,
        transactionValue: context.salePrice,
      };
    }
    return null;
  }

  private nomineePatternRule(context: SaleRiskContext): StrRuleResult | null {
    if (context.buyerPurchaseCountInWindow >= this.appConfigService.nomineeMinPurchases) {
      return {
        alertType: 'NOMINEE_PATTERN',
        reason: `Buyer appears in ${context.buyerPurchaseCountInWindow} purchases within ${this.appConfigService.nomineeWindowDays} days`,
        severity: StrSeverity.CRITICAL,
        transactionValue: context.salePrice,
      };
    }
    return null;
  }

  private rapidResaleRule(context: SaleRiskContext): StrRuleResult | null {
    if (context.isRapidResale) {
      return {
        alertType: 'RAPID_RESALE',
        reason: 'Vehicle appears to have been sold again within a short monitoring period',
        severity: StrSeverity.MEDIUM,
        transactionValue: context.salePrice,
      };
    }
    return null;
  }

  private highCashVolumeRule(context: SaleRiskContext): StrRuleResult | null {
    if (
      context.paymentType === 'CASH' &&
      context.dealershipCashSaleCountInWindow >= this.appConfigService.highCashVolumeCount
    ) {
      return {
        alertType: 'HIGH_CASH_VOLUME',
        reason: `Dealer recorded ${context.dealershipCashSaleCountInWindow} cash sales in the monitored window`,
        severity: StrSeverity.HIGH,
        transactionValue: context.salePrice,
      };
    }
    return null;
  }
}
