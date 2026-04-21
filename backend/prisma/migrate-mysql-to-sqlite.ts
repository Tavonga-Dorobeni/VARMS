import { PrismaClient as SqlitePrismaClient } from '@prisma/client';
import { PrismaClient as MysqlPrismaClient } from './generated/mysql-client';
import { getDatabaseUrlFromEnv, getMysqlDatabaseUrlFromEnv } from '../src/config/database-url.util';

process.env.DATABASE_URL = getDatabaseUrlFromEnv(process.env);
process.env.MYSQL_SOURCE_DATABASE_URL = getMysqlDatabaseUrlFromEnv(process.env);

const sqlite = new SqlitePrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const mysql = new MysqlPrismaClient({
  datasources: {
    db: {
      url: process.env.MYSQL_SOURCE_DATABASE_URL,
    },
  },
});

async function ensureSqliteSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "dealers" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "license_number" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "address" TEXT NOT NULL,
      "contact_info" TEXT NOT NULL,
      "approved_at" DATETIME NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_dealers_license_number" ON "dealers"("license_number")`,
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "full_name" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "agency" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "password_hash" TEXT NOT NULL,
      "dealership_id" INTEGER,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "users_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "dealers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_users_username" ON "users"("username")`,
    `CREATE TABLE IF NOT EXISTS "buyers" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "full_name" TEXT NOT NULL,
      "national_id" TEXT NOT NULL,
      "contact_details" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_buyers_national_id" ON "buyers"("national_id")`,
    `CREATE TABLE IF NOT EXISTS "vehicles" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "vin" TEXT NOT NULL,
      "make" TEXT NOT NULL,
      "model" TEXT NOT NULL,
      "declared_value" DECIMAL NOT NULL,
      "country_of_origin" TEXT NOT NULL,
      "import_date" DATETIME NOT NULL,
      "dealership_id" INTEGER NOT NULL,
      "status" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "vehicles_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "dealers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_vehicles_vin" ON "vehicles"("vin")`,
    `CREATE TABLE IF NOT EXISTS "import_records" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "vehicle_id" INTEGER NOT NULL,
      "officer_id" INTEGER NOT NULL,
      "border_post" TEXT NOT NULL,
      "timestamp" DATETIME NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "import_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "import_records_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "sale_transactions" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "vehicle_id" INTEGER NOT NULL,
      "dealership_id" INTEGER NOT NULL,
      "buyer_id" INTEGER NOT NULL,
      "sale_price" DECIMAL NOT NULL,
      "payment_type" TEXT NOT NULL,
      "proof_of_payment" TEXT NOT NULL,
      "sale_date" DATETIME NOT NULL,
      "is_acting_for_another" BOOLEAN NOT NULL DEFAULT false,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "sale_transactions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "sale_transactions_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "dealers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "sale_transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "beneficial_owners" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "linked_buyer_id" INTEGER NOT NULL,
      "full_name" TEXT NOT NULL,
      "national_id" TEXT NOT NULL,
      "relationship_type" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "beneficial_owners_linked_buyer_id_fkey" FOREIGN KEY ("linked_buyer_id") REFERENCES "buyers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "str_alerts" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "alert_type" TEXT NOT NULL,
      "source_record_id" INTEGER NOT NULL,
      "source_entity_type" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "severity" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "vehicle_id" INTEGER,
      "dealership_id" INTEGER,
      "buyer_id" INTEGER,
      "transaction_value" DECIMAL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "str_alerts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT "str_alerts_dealership_id_fkey" FOREIGN KEY ("dealership_id") REFERENCES "dealers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT "str_alerts_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "registration_records" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "vehicle_id" INTEGER NOT NULL,
      "buyer_id" INTEGER NOT NULL,
      "officer_id" INTEGER NOT NULL,
      "registration_date" DATETIME NOT NULL,
      "status" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "registration_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "registration_records_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "buyers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "registration_records_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "user_id" INTEGER NOT NULL,
      "role" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "entity_type" TEXT NOT NULL,
      "entity_id" INTEGER NOT NULL,
      "before_value" TEXT,
      "after_value" TEXT,
      "reason" TEXT,
      "timestamp" DATETIME NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "idempotency_keys" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "user_id" INTEGER,
      "route" TEXT NOT NULL,
      "method" TEXT NOT NULL,
      "idempotency_key" TEXT NOT NULL,
      "response_code" INTEGER NOT NULL,
      "response_body" TEXT NOT NULL,
      "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" DATETIME NOT NULL,
      CONSTRAINT "idempotency_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_idempotency_request" ON "idempotency_keys"("user_id", "route", "method", "idempotency_key")`,
  ];

  for (const statement of statements) {
    await sqlite.$executeRawUnsafe(statement);
  }
}

async function main() {
  await ensureSqliteSchema();

  const [
    dealers,
    users,
    buyers,
    vehicles,
    importRecords,
    saleTransactions,
    beneficialOwners,
    strAlerts,
    registrationRecords,
    auditLogs,
    idempotencyKeys,
  ] = await Promise.all([
    mysql.dealer.findMany({ orderBy: { id: 'asc' } }),
    mysql.user.findMany({ orderBy: { id: 'asc' } }),
    mysql.buyer.findMany({ orderBy: { id: 'asc' } }),
    mysql.vehicle.findMany({ orderBy: { id: 'asc' } }),
    mysql.importRecord.findMany({ orderBy: { id: 'asc' } }),
    mysql.saleTransaction.findMany({ orderBy: { id: 'asc' } }),
    mysql.beneficialOwner.findMany({ orderBy: { id: 'asc' } }),
    mysql.strAlert.findMany({ orderBy: { id: 'asc' } }),
    mysql.registrationRecord.findMany({ orderBy: { id: 'asc' } }),
    mysql.auditLog.findMany({ orderBy: { id: 'asc' } }),
    mysql.idempotencyKey.findMany({ orderBy: { id: 'asc' } }),
  ]);

  await sqlite.$executeRawUnsafe('PRAGMA foreign_keys = OFF');

  try {
    await sqlite.idempotencyKey.deleteMany();
    await sqlite.auditLog.deleteMany();
    await sqlite.registrationRecord.deleteMany();
    await sqlite.strAlert.deleteMany();
    await sqlite.beneficialOwner.deleteMany();
    await sqlite.saleTransaction.deleteMany();
    await sqlite.importRecord.deleteMany();
    await sqlite.vehicle.deleteMany();
    await sqlite.user.deleteMany();
    await sqlite.buyer.deleteMany();
    await sqlite.dealer.deleteMany();

    if (dealers.length) {
      await sqlite.dealer.createMany({
        data: dealers.map((item) => ({
          id: item.id,
          name: item.name,
          licenseNumber: item.licenseNumber,
          status: item.status,
          address: item.address,
          contactInfo: item.contactInfo,
          approvedAt: item.approvedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (users.length) {
      await sqlite.user.createMany({
        data: users.map((item) => ({
          id: item.id,
          fullName: item.fullName,
          role: item.role,
          agency: item.agency,
          username: item.username,
          passwordHash: item.passwordHash,
          dealershipId: item.dealershipId,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (buyers.length) {
      await sqlite.buyer.createMany({
        data: buyers.map((item) => ({
          id: item.id,
          fullName: item.fullName,
          nationalId: item.nationalId,
          contactDetails: item.contactDetails,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (vehicles.length) {
      await sqlite.vehicle.createMany({
        data: vehicles.map((item) => ({
          id: item.id,
          vin: item.vin,
          make: item.make,
          model: item.model,
          declaredValue: item.declaredValue.toString(),
          countryOfOrigin: item.countryOfOrigin,
          importDate: item.importDate,
          dealershipId: item.dealershipId,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (importRecords.length) {
      await sqlite.importRecord.createMany({
        data: importRecords.map((item) => ({
          id: item.id,
          vehicleId: item.vehicleId,
          officerId: item.officerId,
          borderPost: item.borderPost,
          timestamp: item.timestamp,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (saleTransactions.length) {
      await sqlite.saleTransaction.createMany({
        data: saleTransactions.map((item) => ({
          id: item.id,
          vehicleId: item.vehicleId,
          dealershipId: item.dealershipId,
          buyerId: item.buyerId,
          salePrice: item.salePrice.toString(),
          paymentType: item.paymentType,
          proofOfPayment: item.proofOfPayment,
          saleDate: item.saleDate,
          isActingForAnother: item.isActingForAnother,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (beneficialOwners.length) {
      await sqlite.beneficialOwner.createMany({
        data: beneficialOwners.map((item) => ({
          id: item.id,
          linkedBuyerId: item.linkedBuyerId,
          fullName: item.fullName,
          nationalId: item.nationalId,
          relationshipType: item.relationshipType,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (strAlerts.length) {
      await sqlite.strAlert.createMany({
        data: strAlerts.map((item) => ({
          id: item.id,
          alertType: item.alertType,
          sourceRecordId: item.sourceRecordId,
          sourceEntityType: item.sourceEntityType,
          reason: item.reason,
          severity: item.severity,
          status: item.status,
          vehicleId: item.vehicleId,
          dealershipId: item.dealershipId,
          buyerId: item.buyerId,
          transactionValue: item.transactionValue?.toString(),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (registrationRecords.length) {
      await sqlite.registrationRecord.createMany({
        data: registrationRecords.map((item) => ({
          id: item.id,
          vehicleId: item.vehicleId,
          buyerId: item.buyerId,
          officerId: item.officerId,
          registrationDate: item.registrationDate,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    if (auditLogs.length) {
      await sqlite.auditLog.createMany({
        data: auditLogs.map((item) => ({
          id: item.id,
          userId: item.userId,
          role: item.role,
          action: item.action,
          entityType: item.entityType,
          entityId: item.entityId,
          beforeValue: item.beforeValue ?? undefined,
          afterValue: item.afterValue ?? undefined,
          reason: item.reason,
          timestamp: item.timestamp,
          createdAt: item.createdAt,
        })),
      });
    }

    if (idempotencyKeys.length) {
      await sqlite.idempotencyKey.createMany({
        data: idempotencyKeys.map((item) => ({
          id: item.id,
          userId: item.userId,
          route: item.route,
          method: item.method,
          idempotencyKey: item.idempotencyKey,
          responseCode: item.responseCode,
          responseBody: item.responseBody,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }
  } finally {
    await sqlite.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  }

  console.log(
    `Copied MySQL data to SQLite: dealers=${dealers.length}, users=${users.length}, buyers=${buyers.length}, vehicles=${vehicles.length}, sales=${saleTransactions.length}, alerts=${strAlerts.length}, registrations=${registrationRecords.length}, audit_logs=${auditLogs.length}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([mysql.$disconnect(), sqlite.$disconnect()]);
  });
