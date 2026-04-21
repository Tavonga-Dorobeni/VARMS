import { VehicleStatus } from '@prisma/client';
import { RegistrationService } from '../src/modules/registration/registration.service';

describe('RegistrationService.buildValidation', () => {
  const service = new RegistrationService({} as never);

  it('passes when all four checks are satisfied', () => {
    const result = service.buildValidation(
      {
        id: 1,
        vin: 'JH4KA8260MC000001',
        status: VehicleStatus.SOLD,
        dealership: { id: 1, status: 'ACTIVE' },
        importRecords: [{ id: 1 }],
        sales: [{ id: 1, buyerId: 1, buyer: { nationalId: '63-111111-A-63' } }],
        registrations: [],
      },
      '63-111111-A-63',
    );

    expect(result.eligible).toBe(true);
    expect(result.failure_reason).toBeNull();
  });

  it('fails with buyer mismatch when the national id is different', () => {
    const result = service.buildValidation(
      {
        id: 1,
        vin: 'JH4KA8260MC000001',
        status: VehicleStatus.SOLD,
        dealership: { id: 1, status: 'ACTIVE' },
        importRecords: [{ id: 1 }],
        sales: [{ id: 1, buyerId: 1, buyer: { nationalId: '63-111111-A-63' } }],
        registrations: [],
      },
      '00-000000-Z-00',
    );

    expect(result.eligible).toBe(false);
    expect(result.failure_reason).toBe('Buyer identity does not match sale record');
  });

  it('fails with nominee buyer hold when an active FIU hold applies', () => {
    const result = service.buildValidation(
      {
        id: 1,
        vin: 'JH4KA8260MC000001',
        status: VehicleStatus.SOLD,
        dealership: { id: 1, status: 'ACTIVE' },
        importRecords: [{ id: 1 }],
        sales: [{ id: 1, buyerId: 1, buyer: { nationalId: '63-111111-A-63' } }],
        registrations: [],
      },
      '63-111111-A-63',
      {
        alert_id: 123,
        reason: 'Buyer is under active FIU review for a nominee purchase pattern',
      },
    );

    expect(result.eligible).toBe(false);
    expect(result.failure_reason).toBe(
      'Buyer is under active FIU review for a nominee purchase pattern',
    );
    expect(result.checks).toContainEqual({
      key: 'NOMINEE_BUYER_HOLD',
      passed: false,
      reason: 'Buyer is under active FIU review for a nominee purchase pattern',
      alert_id: 123,
    });
  });

  it('includes the nominee hold check with alert_id when no hold applies', () => {
    const result = service.buildValidation(
      {
        id: 1,
        vin: 'JH4KA8260MC000001',
        status: VehicleStatus.SOLD,
        dealership: { id: 1, status: 'ACTIVE' },
        importRecords: [{ id: 1 }],
        sales: [{ id: 1, buyerId: 1, buyer: { nationalId: '63-111111-A-63' } }],
        registrations: [],
      },
      '63-111111-A-63',
      null,
    );

    expect(result.checks).toContainEqual({
      key: 'NOMINEE_BUYER_HOLD',
      passed: true,
      reason: 'No active FIU nominee-buyer hold applies to this registration request',
      alert_id: undefined,
    });
  });
});
