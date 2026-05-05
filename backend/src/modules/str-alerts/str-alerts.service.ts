import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditAction, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';
import { AppConfigService } from '../../config/app-config.service';
import { UpdateStrStatusDto } from './dto/update-str-status.dto';
import { SaleRiskContext } from './interfaces/str-rule.interface';
import { StrRulesService } from './str-rules.service';

@Injectable()
export class StrAlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfigService: AppConfigService,
    private readonly strRulesService: StrRulesService,
  ) {}

  async evaluateAndCreateAlerts(context: SaleRiskContext) {
    const matches = this.strRulesService.evaluate(context);
    if (matches.length === 0) {
      return [];
    }

    const alerts = [];
    for (const match of matches) {
      const alert = await this.prisma.strAlert.create({
        data: {
          alertType: match.alertType,
          sourceRecordId: context.saleId,
          sourceEntityType: 'sale_transaction',
          reason: match.reason,
          severity: match.severity,
          vehicleId: context.vehicleId,
          dealershipId: context.dealershipId,
          buyerId: context.buyerId,
          transactionValue:
            match.transactionValue !== undefined
              ? new Prisma.Decimal(match.transactionValue)
              : undefined,
        },
      });
      alerts.push(alert);
    }

    await this.prisma.vehicle.update({
      where: { id: context.vehicleId },
      data: { status: 'STR_FLAGGED' },
    });

    return alerts;
  }

  async list(query: PaginationQueryDto & Record<string, unknown>) {
    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.StrAlertWhereInput = {};

    if (query.status) where.status = query.status as never;
    if (query.alert_type) where.alertType = query.alert_type;
    if (query.severity) where.severity = query.severity as never;
    if (query.dealership_search) {
      where.dealership = {
        name: {
          contains: query.dealership_search as string,
        },
      };
    }
    if (query.dealership_id) where.dealershipId = Number(query.dealership_id);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.strAlert.findMany({
        where,
        include: { dealership: true, vehicle: true, buyer: true },
        skip,
        take: limit,
        orderBy: { createdAt: query.sort_order ?? 'desc' },
      }),
      this.prisma.strAlert.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async getById(id: number) {
    const alert = await this.prisma.strAlert.findUnique({
      where: { id },
      include: { dealership: true, vehicle: true, buyer: true },
    });
    if (!alert) {
      throw new NotFoundException('STR alert not found');
    }
    return this.toResponse(alert);
  }

  async updateStatus(id: number, dto: UpdateStrStatusDto) {
    const existing = await this.prisma.strAlert.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('STR alert not found');
    }

    const updated = await this.prisma.strAlert.update({
      where: { id },
      data: { status: dto.status },
    });

    return {
      data: this.toResponse(updated),
      audit: {
        action: AuditAction.UPDATE,
        entityType: 'str_alert',
        entityId: updated.id,
        beforeValue: this.toResponse(existing),
        afterValue: this.toResponse(updated),
        reason: dto.reason,
      },
    };
  }

  async listNomineeFlags(query: PaginationQueryDto) {
    return this.list({ ...query, alert_type: 'NOMINEE_PATTERN' });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async reconcileRollingAlerts() {
    const recentSales = await this.prisma.saleTransaction.findMany({
      take: 50,
      orderBy: { saleDate: 'desc' },
      include: { vehicle: true },
    });

    for (const sale of recentSales) {
      const buyerPurchaseCountInWindow = await this.prisma.saleTransaction.count({
        where: {
          buyerId: sale.buyerId,
          saleDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      });

      const dealershipCashSaleCountInWindow = await this.prisma.saleTransaction.count({
        where: {
          dealershipId: sale.dealershipId,
          paymentType: 'CASH',
          saleDate: {
            gte: this.subtractDays(new Date(), this.appConfigService.highCashVolumeWindowDays),
          },
        },
      });

      const alerts = this.strRulesService.evaluate({
        saleId: sale.id,
        vehicleId: sale.vehicleId,
        dealershipId: sale.dealershipId,
        buyerId: sale.buyerId,
        paymentType: sale.paymentType,
        salePrice: Number(sale.salePrice),
        declaredValue: Number(sale.vehicle.declaredValue),
        saleDate: sale.saleDate,
        buyerPurchaseCountInWindow,
        dealershipCashSaleCountInWindow,
        isRapidResale: false,
      });

      for (const alert of alerts.filter((item) =>
        ['NOMINEE_PATTERN', 'HIGH_CASH_VOLUME'].includes(item.alertType),
      )) {
        const exists = await this.prisma.strAlert.findFirst({
          where: { sourceRecordId: sale.id, alertType: alert.alertType },
        });

        if (!exists) {
          await this.prisma.strAlert.create({
            data: {
              alertType: alert.alertType,
              sourceRecordId: sale.id,
              sourceEntityType: 'sale_transaction',
              reason: alert.reason,
              severity: alert.severity,
              vehicleId: sale.vehicleId,
              dealershipId: sale.dealershipId,
              buyerId: sale.buyerId,
              transactionValue: new Prisma.Decimal(Number(sale.salePrice)),
            },
          });
        }
      }
    }
  }

  private subtractDays(date: Date, days: number) {
    return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private toResponse(alert: {
    id: number;
    alertType: string;
    sourceRecordId: number;
    sourceEntityType: string;
    reason: string;
    severity: string;
    status: string;
    vehicleId: number | null;
    dealershipId: number | null;
    buyerId: number | null;
    transactionValue: Prisma.Decimal | null;
    createdAt: Date;
    updatedAt: Date;
    dealership?: { id: number; name: string } | null;
    vehicle?: { id: number; vin: string } | null;
    buyer?: { id: number; fullName: string; nationalId: string } | null;
  }) {
    return {
      id: alert.id,
      alert_type: alert.alertType,
      source_record_id: alert.sourceRecordId,
      source_entity_type: alert.sourceEntityType,
      reason: alert.reason,
      severity: alert.severity,
      status: alert.status,
      vehicle_id: alert.vehicleId,
      dealership_id: alert.dealershipId,
      buyer_id: alert.buyerId,
      transaction_value: alert.transactionValue,
      created_at: alert.createdAt,
      updated_at: alert.updatedAt,
      dealership: alert.dealership
        ? { id: alert.dealership.id, name: alert.dealership.name }
        : undefined,
      vehicle: alert.vehicle ? { id: alert.vehicle.id, vin: alert.vehicle.vin } : undefined,
      buyer: alert.buyer
        ? {
            id: alert.buyer.id,
            full_name: alert.buyer.fullName,
            national_id: alert.buyer.nationalId,
          }
        : undefined,
    };
  }
}
