import { PaymentType, StrSeverity } from '@prisma/client';
import { StrRulesService } from '../src/modules/str-alerts/str-rules.service';

describe('StrRulesService', () => {
  const service = new StrRulesService({
    strCashThreshold: 10000,
    nomineeMinPurchases: 3,
    nomineeWindowDays: 90,
    priceDisparityPercent: 30,
    highCashVolumeCount: 5,
  } as never);

  it('fires the cash threshold rule', () => {
    const results = service.evaluate({
      saleId: 1,
      vehicleId: 1,
      dealershipId: 1,
      buyerId: 1,
      paymentType: PaymentType.CASH,
      salePrice: 12000,
      declaredValue: 10000,
      saleDate: new Date(),
      buyerPurchaseCountInWindow: 1,
      dealershipCashSaleCountInWindow: 1,
      isRapidResale: false,
    });

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alertType: 'CASH_THRESHOLD',
          severity: StrSeverity.HIGH,
        }),
      ]),
    );
  });

  it('fires the nominee pattern rule', () => {
    const results = service.evaluate({
      saleId: 1,
      vehicleId: 1,
      dealershipId: 1,
      buyerId: 1,
      paymentType: PaymentType.BANK_TRANSFER,
      salePrice: 9000,
      declaredValue: 9000,
      saleDate: new Date(),
      buyerPurchaseCountInWindow: 3,
      dealershipCashSaleCountInWindow: 0,
      isRapidResale: false,
    });

    expect(results).toEqual(
      expect.arrayContaining([expect.objectContaining({ alertType: 'NOMINEE_PATTERN' })]),
    );
  });
});
