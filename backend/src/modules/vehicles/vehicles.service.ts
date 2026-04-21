import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Prisma, UserRole, VehicleStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';
import { isValidVin } from '../../common/utils/vin.util';
import { DealersService } from '../dealers/dealers.service';
import { CreateImportDto } from './dto/create-import.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { ZimraImportsQueryDto } from './dto/zimra-imports-query.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dealersService: DealersService,
  ) {}

  async createImport(dto: CreateImportDto, user: CurrentUser) {
    const vin = dto.vin.toUpperCase();
    if (!isValidVin(vin)) {
      throw new BadRequestException(
        'VIN must be exactly 17 alphanumeric characters (excluding I, O, Q)',
      );
    }

    await this.dealersService.assertDealerIsActive(dto.dealership_id);

    const existing = await this.prisma.vehicle.findUnique({ where: { vin } });
    if (existing) {
      throw new BadRequestException('VIN already exists');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({
        data: {
          vin,
          make: dto.make,
          model: dto.model,
          declaredValue: new Prisma.Decimal(dto.declared_value),
          countryOfOrigin: dto.country_of_origin,
          importDate: new Date(dto.import_date),
          dealershipId: dto.dealership_id,
          status: VehicleStatus.INVENTORY,
        },
      });

      const importRecord = await tx.importRecord.create({
        data: {
          vehicleId: vehicle.id,
          officerId: user.userId,
          borderPost: dto.border_post,
          timestamp: new Date(),
        },
      });

      return { vehicle, importRecord };
    });

    return {
      data: {
        vehicle: this.toVehicleResponse(result.vehicle),
        import_record: this.toImportResponse(result.importRecord),
      },
      audit: {
        action: AuditAction.CREATE,
        entityType: 'import_record',
        entityId: result.importRecord.id,
        afterValue: {
          vehicle: this.toVehicleResponse(result.vehicle),
          import_record: this.toImportResponse(result.importRecord),
        },
      },
    };
  }

  async getImportRecord(id: number) {
    const record = await this.prisma.importRecord.findUnique({
      where: { id },
      include: { vehicle: true, officer: true },
    });
    if (!record) {
      throw new NotFoundException('Import record not found');
    }

    return {
      ...this.toImportResponse(record),
      vehicle: this.toVehicleResponse(record.vehicle),
      officer: {
        id: record.officer.id,
        full_name: record.officer.fullName,
      },
    };
  }

  async getZimraDashboardStats(user: CurrentUser) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayImports, monthlyImports, totalImports, topDealersRaw] = await Promise.all([
      this.prisma.importRecord.count({
        where: {
          officerId: user.userId,
          timestamp: { gte: todayStart },
        },
      }),
      this.prisma.importRecord.count({
        where: {
          officerId: user.userId,
          timestamp: { gte: monthStart },
        },
      }),
      this.prisma.importRecord.count({
        where: {
          officerId: user.userId,
        },
      }),
      this.prisma.importRecord.groupBy({
        by: ['vehicleId'],
        where: {
          timestamp: { gte: monthStart },
          officerId: user.userId,
        },
        _count: { vehicleId: true },
      }),
    ]);

    const vehicleIds = topDealersRaw.map((item) => item.vehicleId);
    const vehicles =
      vehicleIds.length > 0
        ? await this.prisma.vehicle.findMany({
            where: { id: { in: vehicleIds } },
            include: { dealership: true },
          })
        : [];

    const dealerCounts = new Map<number, { id: number; name: string; import_count: number }>();
    for (const item of topDealersRaw) {
      const vehicle = vehicles.find((entry) => entry.id === item.vehicleId);
      if (!vehicle) {
        continue;
      }
      const existing = dealerCounts.get(vehicle.dealershipId);
      if (existing) {
        existing.import_count += item._count.vehicleId;
      } else {
        dealerCounts.set(vehicle.dealershipId, {
          id: vehicle.dealership.id,
          name: vehicle.dealership.name,
          import_count: item._count.vehicleId,
        });
      }
    }

    return {
      today_imports: todayImports,
      monthly_imports: monthlyImports,
      total_imports: totalImports,
      top_dealers: Array.from(dealerCounts.values())
        .sort((a, b) => b.import_count - a.import_count)
        .slice(0, 5),
    };
  }

  async listInventory(dealerId: number, query: InventoryQueryDto, user: CurrentUser) {
    if (user.role === UserRole.DEALER && user.dealershipId !== dealerId) {
      throw new ForbiddenException('Dealers can only view their own inventory');
    }

    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.VehicleWhereInput = { dealershipId: dealerId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.from_date || query.to_date) {
      where.importDate = {
        gte: query.from_date ? new Date(query.from_date) : undefined,
        lte: query.to_date ? new Date(`${query.to_date}T23:59:59.999Z`) : undefined,
      };
    }

    const orderBy = this.getInventoryOrderBy(query.sort_by, query.sort_order ?? 'desc');

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toVehicleResponse(item)),
      total,
      page,
      limit,
    };
  }

  async getVehicleDetail(id: number, user: CurrentUser) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        dealership: true,
        importRecords: true,
        sales: {
          include: { buyer: true },
        },
        registrations: true,
        strAlerts: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (user.role === UserRole.DEALER && user.dealershipId !== vehicle.dealershipId) {
      throw new ForbiddenException('Dealers can only view their own vehicles');
    }

    return {
      ...this.toVehicleResponse(vehicle),
      dealership: {
        id: vehicle.dealership.id,
        name: vehicle.dealership.name,
        status: vehicle.dealership.status,
      },
      import_records: vehicle.importRecords.map((record) => this.toImportResponse(record)),
      sales: vehicle.sales.map((sale) => ({
        id: sale.id,
        sale_price: sale.salePrice,
        payment_type: sale.paymentType,
        sale_date: sale.saleDate,
        buyer: {
          id: sale.buyer.id,
          full_name: sale.buyer.fullName,
          national_id: sale.buyer.nationalId,
        },
      })),
      registrations: vehicle.registrations.map((registration) => ({
        id: registration.id,
        registration_date: registration.registrationDate,
        status: registration.status,
      })),
      str_alerts: vehicle.strAlerts.map((alert) => ({
        id: alert.id,
        alert_type: alert.alertType,
        status: alert.status,
      })),
    };
  }

  async listImports(query: ZimraImportsQueryDto, user: CurrentUser) {
    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.ImportRecordWhereInput = {
      officerId: user.userId,
    };

    if (query.dealership_id) {
      where.vehicle = {
        dealershipId: query.dealership_id,
      };
    }

    if (query.search) {
      where.OR = [
        {
          borderPost: {
            contains: query.search,
          },
        },
        {
          vehicle: {
            vin: {
              contains: query.search,
            },
          },
        },
        {
          vehicle: {
            make: {
              contains: query.search,
            },
          },
        },
        {
          vehicle: {
            model: {
              contains: query.search,
            },
          },
        },
      ];
    }

    if (query.date_from || query.date_to) {
      where.timestamp = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to ? new Date(`${query.date_to}T23:59:59.999Z`) : undefined,
      };
    }

    const orderBy = this.getImportOrderBy(query.sort_by, query.sort_order ?? 'desc');

    const [items, total] = await this.prisma.$transaction([
      this.prisma.importRecord.findMany({
        where,
        include: { vehicle: true },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.importRecord.count({ where }),
    ]);

    return {
      items: items.map((record) => ({
        ...this.toImportResponse(record),
        vehicle: this.toVehicleResponse(record.vehicle),
      })),
      total,
      page,
      limit,
    };
  }

  private getImportOrderBy(
    sortBy: ZimraImportsQueryDto['sort_by'],
    sortOrder: 'asc' | 'desc',
  ): Prisma.ImportRecordOrderByWithRelationInput | Prisma.ImportRecordOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'import_date':
        return { vehicle: { importDate: sortOrder } };
      case 'vin':
        return { vehicle: { vin: sortOrder } };
      case 'make':
        return { vehicle: { make: sortOrder } };
      case 'model':
        return { vehicle: { model: sortOrder } };
      case 'border_post':
        return { borderPost: sortOrder };
      case 'timestamp':
      default:
        return { timestamp: sortOrder };
    }
  }

  private getInventoryOrderBy(
    sortBy: InventoryQueryDto['sort_by'],
    sortOrder: 'asc' | 'desc',
  ): Prisma.VehicleOrderByWithRelationInput {
    switch (sortBy) {
      case 'import_date':
        return { importDate: sortOrder };
      case 'vin':
        return { vin: sortOrder };
      case 'make':
        return { make: sortOrder };
      case 'declared_value':
        return { declaredValue: sortOrder };
      case 'status':
        return { status: sortOrder };
      case 'created_at':
      default:
        return { createdAt: sortOrder };
    }
  }

  private toVehicleResponse(vehicle: {
    id: number;
    vin: string;
    make: string;
    model: string;
    declaredValue: Prisma.Decimal;
    countryOfOrigin: string;
    importDate: Date;
    dealershipId: number;
    status: VehicleStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: vehicle.id,
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      declared_value: vehicle.declaredValue,
      country_of_origin: vehicle.countryOfOrigin,
      import_date: vehicle.importDate,
      dealership_id: vehicle.dealershipId,
      status: vehicle.status,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    };
  }

  private toImportResponse(record: {
    id: number;
    vehicleId: number;
    officerId: number;
    borderPost: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: record.id,
      vehicle_id: record.vehicleId,
      officer_id: record.officerId,
      border_post: record.borderPost,
      timestamp: record.timestamp,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    };
  }
}
