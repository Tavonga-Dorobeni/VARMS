import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';

@Injectable()
export class FiuService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [activeStrs, monthlyImports, activeDealers, nomineeFlags] = await Promise.all([
      this.prisma.strAlert.count({
        where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      }),
      this.prisma.importRecord.count({
        where: {
          timestamp: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.dealer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.strAlert.count({ where: { alertType: 'NOMINEE_PATTERN' } }),
    ]);

    return {
      active_str_count: activeStrs,
      monthly_imports: monthlyImports,
      active_dealers: activeDealers,
      nominee_flags: nomineeFlags,
    };
  }

  async listVehicles(query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.paginatedQuery('vehicle', query);
  }

  async listSales(query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.paginatedQuery('sale', query);
  }

  async listDealers(query: PaginationQueryDto & Record<string, string | undefined>) {
    return this.paginatedQuery('dealer', query);
  }

  async getTrends() {
    const imports = await this.prisma.importRecord.groupBy({
      by: ['timestamp'],
      _count: { id: true },
      orderBy: { timestamp: 'asc' },
    });
    const sales = await this.prisma.saleTransaction.groupBy({
      by: ['saleDate'],
      _count: { id: true },
      orderBy: { saleDate: 'asc' },
    });

    return {
      imports: imports.map((item) => ({ date: item.timestamp, count: item._count.id })),
      sales: sales.map((item) => ({ date: item.saleDate, count: item._count.id })),
    };
  }

  private async paginatedQuery(
    entity: 'vehicle' | 'sale' | 'dealer',
    query: PaginationQueryDto & Record<string, string | undefined>,
  ) {
    const { page, limit, skip } = normalizePagination(query);

    if (entity === 'vehicle') {
      const where: Prisma.VehicleWhereInput = {};
      if (query.vin) where.vin = { contains: query.vin };
      if (query.dealership_id) where.dealershipId = Number(query.dealership_id);
      const [items, total] = await this.prisma.$transaction([
        this.prisma.vehicle.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.vehicle.count({ where }),
      ]);
      return { items, total, page, limit };
    }

    if (entity === 'sale') {
      const where: Prisma.SaleTransactionWhereInput = {};
      if (query.payment_type) where.paymentType = query.payment_type as never;
      if (query.dealership_id) where.dealershipId = Number(query.dealership_id);
      const [items, total] = await this.prisma.$transaction([
        this.prisma.saleTransaction.findMany({ where, skip, take: limit, orderBy: { saleDate: 'desc' } }),
        this.prisma.saleTransaction.count({ where }),
      ]);
      return { items, total, page, limit };
    }

    const where: Prisma.DealerWhereInput = {};
    if (query.search) where.name = { contains: query.search };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.dealer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.dealer.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
