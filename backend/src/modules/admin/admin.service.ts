import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalDealers,
      activeDealers,
      suspendedDealers,
      totalVehicles,
      totalSales,
      recentAuditCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.dealer.count(),
      this.prisma.dealer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.dealer.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.vehicle.count(),
      this.prisma.saleTransaction.count(),
      this.prisma.auditLog.count({
        where: {
          timestamp: {
            gte: last24Hours,
          },
        },
      }),
    ]);

    return {
      total_users: totalUsers,
      total_dealers: totalDealers,
      active_dealers: activeDealers,
      suspended_dealers: suspendedDealers,
      total_vehicles: totalVehicles,
      total_sales: totalSales,
      recent_audit_count: recentAuditCount,
    };
  }
}
