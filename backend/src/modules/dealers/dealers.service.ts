import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, DealerStatus, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';
import { UpdateDealerStatusDto } from './dto/update-dealer-status.dto';

@Injectable()
export class DealersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDealerDto) {
    const dealer = await this.prisma.dealer.create({
      data: {
        name: dto.name,
        licenseNumber: dto.license_number,
        address: dto.address,
        contactInfo: dto.contact_info,
        approvedAt: new Date(dto.approved_at),
      },
    });

    return {
      data: this.toResponse(dealer),
      audit: {
        action: AuditAction.CREATE,
        entityType: 'dealer',
        entityId: dealer.id,
        afterValue: this.toResponse(dealer),
      },
    };
  }

  async list(
    query: PaginationQueryDto & { status?: DealerStatus; search?: string },
    user: CurrentUser,
  ) {
    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.DealerWhereInput = {};

    if (user.role === 'ZIMRA_OFFICER') {
      where.status = 'ACTIVE';
    }

    if (query.status) {
      if (user.role === 'ZIMRA_OFFICER' && query.status !== 'ACTIVE') {
        where.status = 'ACTIVE';
      } else {
        where.status = query.status;
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { licenseNumber: { contains: query.search } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.dealer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: query.sort_order ?? 'desc' },
      }),
      this.prisma.dealer.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async getById(id: number) {
    const dealer = await this.prisma.dealer.findUnique({ where: { id } });
    if (!dealer) {
      throw new NotFoundException('Dealership not found');
    }
    return this.toResponse(dealer);
  }

  async getDashboardStats(id: number, user: CurrentUser) {
    if (user.dealershipId !== id) {
      throw new ForbiddenException('Dealers can only view their own dashboard');
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      inventoryCount,
      soldCount,
      registeredCount,
      salesAggregate,
      monthlySalesAggregate,
      recentSales,
    ] = await Promise.all([
      this.prisma.vehicle.count({
        where: { dealershipId: id, status: 'INVENTORY' },
      }),
      this.prisma.vehicle.count({
        where: { dealershipId: id, status: 'SOLD' },
      }),
      this.prisma.vehicle.count({
        where: { dealershipId: id, status: 'REGISTERED' },
      }),
      this.prisma.saleTransaction.aggregate({
        where: { dealershipId: id },
        _sum: { salePrice: true },
      }),
      this.prisma.saleTransaction.aggregate({
        where: {
          dealershipId: id,
          saleDate: { gte: monthStart },
        },
        _sum: { salePrice: true },
      }),
      this.prisma.saleTransaction.findMany({
        where: { dealershipId: id },
        include: { buyer: true, vehicle: true },
        orderBy: { saleDate: 'desc' },
        take: 5,
      }),
    ]);

    return {
      inventory_count: inventoryCount,
      sold_count: soldCount,
      registered_count: registeredCount,
      total_sales_value: salesAggregate._sum.salePrice
        ? Number(salesAggregate._sum.salePrice)
        : 0,
      monthly_sales_value: monthlySalesAggregate._sum.salePrice
        ? Number(monthlySalesAggregate._sum.salePrice)
        : 0,
      recent_sales: recentSales.map((sale) => ({
        id: sale.id,
        buyer_full_name: sale.buyer.fullName,
        sale_price: Number(sale.salePrice),
        sale_date: sale.saleDate,
        vehicle_vin: sale.vehicle.vin,
      })),
    };
  }

  async update(id: number, dto: UpdateDealerDto) {
    const existing = await this.prisma.dealer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Dealership not found');
    }

    const updated = await this.prisma.dealer.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        contactInfo: dto.contact_info,
      },
    });

    return {
      data: this.toResponse(updated),
      audit: {
        action: AuditAction.UPDATE,
        entityType: 'dealer',
        entityId: updated.id,
        beforeValue: this.toResponse(existing),
        afterValue: this.toResponse(updated),
        reason: dto.reason,
      },
    };
  }

  async updateStatus(id: number, dto: UpdateDealerStatusDto) {
    const existing = await this.prisma.dealer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Dealership not found');
    }

    const updated = await this.prisma.dealer.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      data: this.toResponse(updated),
      audit: {
        action: AuditAction.UPDATE,
        entityType: 'dealer',
        entityId: updated.id,
        beforeValue: this.toResponse(existing),
        afterValue: this.toResponse(updated),
        reason: dto.reason,
      },
    };
  }

  async assertDealerIsActive(id: number) {
    const dealer = await this.prisma.dealer.findUnique({ where: { id } });
    if (!dealer) {
      throw new BadRequestException('Dealership not found');
    }
    if (dealer.status !== 'ACTIVE') {
      throw new BadRequestException('Only active dealerships can perform this action');
    }
    return dealer;
  }

  private toResponse(dealer: {
    id: number;
    name: string;
    licenseNumber: string;
    status: DealerStatus;
    address: string;
    contactInfo: string;
    approvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: dealer.id,
      name: dealer.name,
      license_number: dealer.licenseNumber,
      status: dealer.status,
      address: dealer.address,
      contact_info: dealer.contactInfo,
      approved_at: dealer.approvedAt,
      created_at: dealer.createdAt,
      updated_at: dealer.updatedAt,
    };
  }
}
