import { PrismaClient, PaymentType, RegistrationStatus, StrSeverity, StrStatus, UserRole, VehicleStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.registrationRecord.deleteMany();
  await prisma.strAlert.deleteMany();
  await prisma.beneficialOwner.deleteMany();
  await prisma.saleTransaction.deleteMany();
  await prisma.importRecord.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.idempotencyKey.deleteMany();

  const [activeDealer, suspendedDealer] = await prisma.$transaction([
    prisma.dealer.create({
      data: {
        name: 'Harare Auto Hub',
        licenseNumber: 'DLR-001',
        status: 'ACTIVE',
        address: '12 Samora Machel Ave, Harare',
        contactInfo: '+263-77-000-0001',
        approvedAt: new Date('2026-01-15'),
      },
    }),
    prisma.dealer.create({
      data: {
        name: 'Bulawayo Motor Traders',
        licenseNumber: 'DLR-002',
        status: 'SUSPENDED',
        address: '45 Jason Moyo St, Bulawayo',
        contactInfo: '+263-77-000-0002',
        approvedAt: new Date('2026-01-20'),
      },
    }),
  ]);

  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        fullName: 'System Admin',
        role: UserRole.ADMIN,
        agency: 'VARMS',
        username: 'admin',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'ZIMRA Officer',
        role: UserRole.ZIMRA_OFFICER,
        agency: 'ZIMRA',
        username: 'zimra',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'Dealer User',
        role: UserRole.DEALER,
        agency: 'Harare Auto Hub',
        username: 'dealer',
        passwordHash,
        dealershipId: activeDealer.id,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'CVR Officer',
        role: UserRole.CVR_OFFICER,
        agency: 'CVR',
        username: 'cvr',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        fullName: 'FIU Analyst',
        role: UserRole.FIU_ANALYST,
        agency: 'FIU',
        username: 'fiu',
        passwordHash,
      },
    }),
  ]);

  const buyers = await prisma.$transaction([
    prisma.buyer.create({
      data: {
        fullName: 'Tawanda Moyo',
        nationalId: '63-111111-A-63',
        contactDetails: '+263-77-111-1111',
      },
    }),
    prisma.buyer.create({
      data: {
        fullName: 'Nominee Buyer',
        nationalId: '12-222222-B-12',
        contactDetails: '+263-77-222-2222',
      },
    }),
  ]);

  const vehicle = await prisma.vehicle.create({
    data: {
      vin: 'JH4KA8260MC000001',
      make: 'Toyota',
      model: 'Hilux',
      declaredValue: 12000,
      countryOfOrigin: 'Japan',
      importDate: new Date('2026-03-05'),
      dealershipId: activeDealer.id,
      status: VehicleStatus.SOLD,
    },
  });

  await prisma.importRecord.create({
    data: {
      vehicleId: vehicle.id,
      officerId: users[1].id,
      borderPost: 'Beitbridge',
      timestamp: new Date('2026-03-05T10:00:00Z'),
    },
  });

  const sale = await prisma.saleTransaction.create({
    data: {
      vehicleId: vehicle.id,
      dealershipId: activeDealer.id,
      buyerId: buyers[0].id,
      salePrice: 18000,
      paymentType: PaymentType.CASH,
      proofOfPayment: 'BANKSLIP-001',
      saleDate: new Date('2026-03-18'),
      isActingForAnother: false,
    },
  });

  await prisma.strAlert.create({
    data: {
      alertType: 'CASH_THRESHOLD',
      sourceRecordId: sale.id,
      sourceEntityType: 'sale_transaction',
      reason: 'Cash sale exceeds threshold',
      severity: StrSeverity.HIGH,
      status: StrStatus.PENDING,
      vehicleId: vehicle.id,
      dealershipId: activeDealer.id,
      buyerId: buyers[0].id,
      transactionValue: 18000,
    },
  });

  await prisma.registrationRecord.create({
    data: {
      vehicleId: vehicle.id,
      buyerId: buyers[0].id,
      officerId: users[3].id,
      registrationDate: new Date('2026-03-25'),
      status: RegistrationStatus.APPROVED,
    },
  });

  await prisma.vehicle.createMany({
    data: [
      {
        vin: 'JH4KA8260MC000002',
        make: 'Nissan',
        model: 'Navara',
        declaredValue: 15000,
        countryOfOrigin: 'Japan',
        importDate: new Date('2026-04-01'),
        dealershipId: activeDealer.id,
        status: VehicleStatus.INVENTORY,
      },
      {
        vin: 'JH4KA8260MC000003',
        make: 'Mazda',
        model: 'BT-50',
        declaredValue: 11000,
        countryOfOrigin: 'Thailand',
        importDate: new Date('2026-04-03'),
        dealershipId: suspendedDealer.id,
        status: VehicleStatus.INVENTORY,
      },
    ],
  });

  console.log('Seeded VARMS backend data');
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
