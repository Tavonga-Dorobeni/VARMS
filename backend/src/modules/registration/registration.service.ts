import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AuditAction,
  Prisma,
  RegistrationStatus,
  VehicleStatus,
} from '@prisma/client';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { RegistrationListQueryDto } from './dto/registration-list-query.dto';
import { RegistrationSearchDto } from './dto/registration-search.dto';

@Injectable()
export class RegistrationService {
  private static readonly ACTIVE_NOMINEE_HOLD_STATUSES = ['OPEN', 'UNDER_REVIEW', 'PENDING'];

  constructor(private readonly prisma: PrismaService) {}

  async list(query: RegistrationListQueryDto, user: CurrentUser) {
    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.RegistrationRecordWhereInput = {
      officerId: user.userId,
    };

    if (query.search) {
      where.OR = [
        {
          vehicle: {
            vin: {
              contains: query.search,
            },
          },
        },
        {
          buyer: {
            fullName: {
              contains: query.search,
            },
          },
        },
        {
          buyer: {
            nationalId: {
              contains: query.search,
            },
          },
        },
      ];
    }

    if (query.date_from || query.date_to) {
      where.registrationDate = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to ? new Date(`${query.date_to}T23:59:59.999Z`) : undefined,
      };
    }

    const orderBy = this.getRegistrationOrderBy(query.sort_by, query.sort_order ?? 'desc');

    const [items, total] = await this.prisma.$transaction([
      this.prisma.registrationRecord.findMany({
        where,
        include: {
          buyer: true,
          vehicle: true,
          officer: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.registrationRecord.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async search(query: RegistrationSearchDto) {
    const vehicle = await this.resolveVehicle(query);
    const nomineeHold = await this.findNomineeBuyerHold(vehicle);
    return this.buildValidation(vehicle, query.national_id, nomineeHold);
  }

  async getDashboardStats(user: CurrentUser) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRegistrations, monthlyRegistrations, totalRegistrations, pendingVehicles] =
      await Promise.all([
        this.prisma.registrationRecord.count({
          where: {
            officerId: user.userId,
            createdAt: { gte: todayStart },
          },
        }),
        this.prisma.registrationRecord.count({
          where: {
            officerId: user.userId,
            createdAt: { gte: monthStart },
          },
        }),
        this.prisma.registrationRecord.count({
          where: { officerId: user.userId },
        }),
        this.prisma.vehicle.count({
          where: { status: 'SOLD' },
        }),
      ]);

    return {
      today_registrations: todayRegistrations,
      monthly_registrations: monthlyRegistrations,
      total_registrations: totalRegistrations,
      pending_vehicles: pendingVehicles,
    };
  }

  async approve(dto: ApproveRegistrationDto, user: CurrentUser) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicle_id },
      include: {
        importRecords: true,
        dealership: true,
        sales: {
          include: { buyer: true },
          orderBy: { saleDate: 'desc' },
        },
        registrations: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const nomineeHold = await this.findNomineeBuyerHold(vehicle);
    const validation = this.buildValidation(vehicle, dto.national_id, nomineeHold);
    if (!validation.eligible) {
      throw new BadRequestException(validation.failure_reason);
    }

    if (vehicle.status === VehicleStatus.REGISTERED || vehicle.registrations.length > 0) {
      throw new BadRequestException('Vehicle is already registered');
    }

    const sale = vehicle.sales[0];
    const registration = await this.prisma.$transaction(async (tx) => {
      const created = await tx.registrationRecord.create({
        data: {
          vehicleId: vehicle.id,
          buyerId: sale.buyerId,
          officerId: user.userId,
          registrationDate: new Date(dto.registration_date),
          status: RegistrationStatus.APPROVED,
        },
      });

      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: VehicleStatus.REGISTERED },
      });

      return created;
    });

    return {
      data: {
        id: registration.id,
        vehicle_id: registration.vehicleId,
        buyer_id: registration.buyerId,
        officer_id: registration.officerId,
        registration_date: registration.registrationDate,
        status: registration.status,
      },
      audit: {
        action: AuditAction.CREATE,
        entityType: 'registration_record',
        entityId: registration.id,
        afterValue: {
          id: registration.id,
          vehicle_id: registration.vehicleId,
          status: registration.status,
        },
      },
    };
  }

  buildValidation(
    vehicle:
      | {
          id: number;
          vin: string;
          status: VehicleStatus;
          dealership: { id: number; status: string };
          importRecords: { id: number }[];
          sales: { id: number; buyerId: number; saleDate?: Date; buyer: { nationalId: string } }[];
          registrations: { id: number }[];
        }
      | null,
    nationalId: string,
    nomineeHold?: { alert_id: number; reason: string } | null,
  ) {
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const latestSale = vehicle.sales[0];
    const checks = [
      {
        key: 'import_log',
        passed: vehicle.importRecords.length > 0,
        reason: vehicle.importRecords.length > 0 ? 'ZIMRA import record found' : 'Missing import record',
      },
      {
        key: 'dealer_trail',
        passed: vehicle.dealership.status === 'ACTIVE',
        reason:
          vehicle.dealership.status === 'ACTIVE'
            ? 'Dealer trail is active'
            : 'Missing valid sale record from approved dealership',
      },
      {
        key: 'sale_record',
        passed: Boolean(latestSale),
        reason: latestSale ? 'Valid sale record found' : 'Missing valid sale record',
      },
      {
        key: 'buyer_match',
        passed: latestSale?.buyer.nationalId === nationalId,
        reason:
          latestSale?.buyer.nationalId === nationalId
            ? 'Buyer identity matches'
            : 'Buyer identity does not match sale record',
      },
      {
        key: 'NOMINEE_BUYER_HOLD',
        passed: !nomineeHold,
        reason:
          nomineeHold?.reason ??
          'No active FIU nominee-buyer hold applies to this registration request',
        alert_id: nomineeHold?.alert_id,
      },
    ];

    const failed = checks.find((item) => !item.passed);
    return {
      eligible: !failed,
      failure_reason: failed?.reason ?? null,
      checks,
      vehicle: {
        id: vehicle.id,
        vin: vehicle.vin,
        status: vehicle.status,
      },
    };
  }

  private async findNomineeBuyerHold(
    vehicle:
      | {
          sales: { buyerId: number; saleDate: Date }[];
        }
      | null,
  ) {
    if (!vehicle?.sales?.length) {
      return null;
    }

    const latestSale = vehicle.sales[0];
    const activeAlerts = await this.prisma.$queryRaw<
      Array<{
        id: number;
        reason: string;
        sourceRecordId: number;
        status: string;
      }>
    >`
      SELECT
        id,
        reason,
        source_record_id AS sourceRecordId,
        status
      FROM str_alerts
      WHERE buyer_id = ${latestSale.buyerId}
        AND alert_type = 'NOMINEE_PATTERN'
        AND source_entity_type = 'sale_transaction'
      ORDER BY created_at ASC
    `;

    const holdAlerts = activeAlerts.filter((alert) =>
      RegistrationService.ACTIVE_NOMINEE_HOLD_STATUSES.includes(alert.status),
    );

    if (holdAlerts.length === 0) {
      return null;
    }

    const sourceSales = await this.prisma.saleTransaction.findMany({
      where: {
        id: { in: holdAlerts.map((alert) => alert.sourceRecordId) },
      },
      select: {
        id: true,
        saleDate: true,
      },
    });

    const saleDateById = new Map(sourceSales.map((sale) => [sale.id, sale.saleDate]));
    const applicableAlert = holdAlerts.find((alert) => {
      const triggerSaleDate = saleDateById.get(alert.sourceRecordId);
      return triggerSaleDate && latestSale.saleDate >= triggerSaleDate;
    });

    if (!applicableAlert) {
      return null;
    }

    return {
      alert_id: applicableAlert.id,
      reason: applicableAlert.reason,
    };
  }

  private async resolveVehicle(query: RegistrationSearchDto) {
    if (!query.vin && !query.ref) {
      throw new BadRequestException('Provide vin or ref');
    }

    if (query.ref) {
      const sale = await this.prisma.saleTransaction.findUnique({
        where: { id: Number(query.ref) },
      });
      if (!sale) {
        throw new NotFoundException('Sale record not found');
      }
      return this.prisma.vehicle.findUnique({
        where: { id: sale.vehicleId },
        include: {
          dealership: true,
          importRecords: true,
          sales: {
            include: { buyer: true },
            orderBy: { saleDate: 'desc' },
          },
          registrations: true,
        },
      });
    }

    return this.prisma.vehicle.findUnique({
      where: { vin: query.vin?.toUpperCase() },
      include: {
        dealership: true,
        importRecords: true,
        sales: {
          include: { buyer: true },
          orderBy: { saleDate: 'desc' },
        },
        registrations: true,
      },
    });
  }

  private getRegistrationOrderBy(
    sortBy: RegistrationListQueryDto['sort_by'],
    sortOrder: 'asc' | 'desc',
  ):
    | Prisma.RegistrationRecordOrderByWithRelationInput
    | Prisma.RegistrationRecordOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'created_at':
        return { createdAt: sortOrder };
      case 'vin':
        return { vehicle: { vin: sortOrder } };
      case 'buyer_full_name':
        return { buyer: { fullName: sortOrder } };
      case 'status':
        return { status: sortOrder };
      case 'registration_date':
      default:
        return { registrationDate: sortOrder };
    }
  }

  private toResponse(record: {
    id: number;
    vehicleId: number;
    buyerId: number;
    officerId: number;
    registrationDate: Date;
    status: RegistrationStatus;
    createdAt: Date;
    updatedAt: Date;
    vehicle?: { id: number; vin: string; make: string; model: string } | null;
    buyer?: { id: number; fullName: string; nationalId: string; contactDetails: string } | null;
    officer?:
      | {
          id: number;
          fullName: string;
          role: string;
          agency: string;
          username: string;
          dealershipId: number | null;
          status: string;
          createdAt: Date;
          updatedAt: Date;
        }
      | null;
  }) {
    return {
      id: record.id,
      vehicle_id: record.vehicleId,
      buyer_id: record.buyerId,
      officer_id: record.officerId,
      registration_date: record.registrationDate,
      status: record.status,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      vehicle: record.vehicle
        ? {
            id: record.vehicle.id,
            vin: record.vehicle.vin,
            make: record.vehicle.make,
            model: record.vehicle.model,
          }
        : undefined,
      buyer: record.buyer
        ? {
            id: record.buyer.id,
            full_name: record.buyer.fullName,
            national_id: record.buyer.nationalId,
            contact_details: record.buyer.contactDetails,
          }
        : undefined,
      officer: record.officer
        ? {
            id: record.officer.id,
            full_name: record.officer.fullName,
            role: record.officer.role,
            agency: record.officer.agency,
            username: record.officer.username,
            dealership_id: record.officer.dealershipId,
            status: record.officer.status,
            created_at: record.officer.createdAt,
            updated_at: record.officer.updatedAt,
          }
        : undefined,
    };
  }
}
