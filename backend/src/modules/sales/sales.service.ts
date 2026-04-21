import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, PaymentType, Prisma, UserRole, VehicleStatus } from '@prisma/client';
import { CurrentUser } from '../../common/interfaces/current-user.interface';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';
import { AppConfigService } from '../../config/app-config.service';
import { DealersService } from '../dealers/dealers.service';
import { StrAlertsService } from '../str-alerts/str-alerts.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SalesListQueryDto } from './dto/sales-list-query.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfigService: AppConfigService,
    private readonly dealersService: DealersService,
    private readonly strAlertsService: StrAlertsService,
  ) {}

  async create(dto: CreateSaleDto, user: CurrentUser) {
    if (!user.dealershipId) {
      throw new ForbiddenException('Dealer account is not linked to a dealership');
    }

    await this.dealersService.assertDealerIsActive(user.dealershipId);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicle_id },
      include: { sales: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.dealershipId !== user.dealershipId) {
      throw new ForbiddenException('Vehicle does not belong to this dealer');
    }

    if (vehicle.status !== VehicleStatus.INVENTORY) {
      throw new BadRequestException('Vehicle must be in inventory status to be sold');
    }

    if (
      dto.is_acting_for_another &&
      (!dto.beneficial_owner_full_name ||
        !dto.beneficial_owner_national_id ||
        !dto.beneficial_owner_relationship_type)
    ) {
      throw new BadRequestException('Beneficial owner details are required');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const buyer = await tx.buyer.upsert({
        where: { nationalId: dto.buyer_national_id },
        update: {
          fullName: dto.buyer_full_name,
          contactDetails: dto.buyer_contact_details,
        },
        create: {
          fullName: dto.buyer_full_name,
          nationalId: dto.buyer_national_id,
          contactDetails: dto.buyer_contact_details,
        },
      });

      if (dto.is_acting_for_another) {
        await tx.beneficialOwner.create({
          data: {
            linkedBuyerId: buyer.id,
            fullName: dto.beneficial_owner_full_name!,
            nationalId: dto.beneficial_owner_national_id!,
            relationshipType: dto.beneficial_owner_relationship_type!,
          },
        });
      }

      const sale = await tx.saleTransaction.create({
        data: {
          vehicleId: vehicle.id,
          dealershipId: user.dealershipId!,
          buyerId: buyer.id,
          salePrice: new Prisma.Decimal(dto.sale_price),
          paymentType: dto.payment_type,
          proofOfPayment: dto.proof_of_payment,
          saleDate: new Date(dto.sale_date),
          isActingForAnother: dto.is_acting_for_another,
        },
      });

      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: VehicleStatus.SOLD },
      });

      return { buyer, sale };
    });

    const buyerPurchaseCountInWindow = await this.prisma.saleTransaction.count({
      where: {
        buyerId: result.buyer.id,
        saleDate: { gte: new Date(new Date(dto.sale_date).getTime() - 90 * 24 * 60 * 60 * 1000) },
      },
    });

    const dealershipCashSaleCountInWindow = await this.prisma.saleTransaction.count({
      where: {
        dealershipId: user.dealershipId,
        paymentType: PaymentType.CASH,
        saleDate: {
          gte: this.subtractDays(
            new Date(dto.sale_date),
            this.appConfigService.highCashVolumeWindowDays,
          ),
        },
      },
    });

    await this.strAlertsService.evaluateAndCreateAlerts({
      saleId: result.sale.id,
      vehicleId: vehicle.id,
      dealershipId: user.dealershipId,
      buyerId: result.buyer.id,
      paymentType: dto.payment_type,
      salePrice: dto.sale_price,
      declaredValue: Number(vehicle.declaredValue),
      saleDate: new Date(dto.sale_date),
      buyerPurchaseCountInWindow,
      dealershipCashSaleCountInWindow,
      isRapidResale: vehicle.sales.length > 0,
    });

    return {
      data: this.toResponse(result.sale),
      audit: {
        action: AuditAction.CREATE,
        entityType: 'sale_transaction',
        entityId: result.sale.id,
        afterValue: this.toResponse(result.sale),
      },
    };
  }

  async list(query: SalesListQueryDto, user: CurrentUser) {
    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.SaleTransactionWhereInput = {};

    if (user.role === UserRole.DEALER) {
      where.dealershipId = user.dealershipId ?? -1;
    } else if (query.dealership_id) {
      where.dealershipId = query.dealership_id;
    }

    if (query.payment_type) {
      where.paymentType = query.payment_type;
    }

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
      where.saleDate = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to ? new Date(`${query.date_to}T23:59:59.999Z`) : undefined,
      };
    }

    const orderBy = this.getSalesOrderBy(query.sort_by, query.sort_order ?? 'desc');

    const [items, total] = await this.prisma.$transaction([
      this.prisma.saleTransaction.findMany({
        where,
        include: { buyer: true, vehicle: true },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.saleTransaction.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async getById(id: number, user: CurrentUser) {
    const sale = await this.prisma.saleTransaction.findUnique({
      where: { id },
      include: { buyer: true, vehicle: true },
    });
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    if (user.role === UserRole.DEALER && user.dealershipId !== sale.dealershipId) {
      throw new ForbiddenException('Dealers can only view their own sales');
    }
    return this.toResponse(sale);
  }

  private toResponse(sale: {
    id: number;
    vehicleId: number;
    dealershipId: number;
    buyerId: number;
    salePrice: Prisma.Decimal;
    paymentType: PaymentType;
    proofOfPayment: string;
    saleDate: Date;
    isActingForAnother: boolean;
    createdAt: Date;
    updatedAt: Date;
    buyer?: { id: number; fullName: string; nationalId: string } | null;
    vehicle?: { id: number; vin: string; make: string; model: string } | null;
  }) {
    return {
      id: sale.id,
      vehicle_id: sale.vehicleId,
      dealership_id: sale.dealershipId,
      buyer_id: sale.buyerId,
      sale_price: sale.salePrice,
      payment_type: sale.paymentType,
      proof_of_payment: sale.proofOfPayment,
      sale_date: sale.saleDate,
      is_acting_for_another: sale.isActingForAnother,
      created_at: sale.createdAt,
      updated_at: sale.updatedAt,
      buyer: sale.buyer
        ? {
            id: sale.buyer.id,
            full_name: sale.buyer.fullName,
            national_id: sale.buyer.nationalId,
          }
        : undefined,
      vehicle: sale.vehicle
        ? {
            id: sale.vehicle.id,
            vin: sale.vehicle.vin,
            make: sale.vehicle.make,
            model: sale.vehicle.model,
          }
        : undefined,
    };
  }

  private getSalesOrderBy(
    sortBy: SalesListQueryDto['sort_by'],
    sortOrder: 'asc' | 'desc',
  ): Prisma.SaleTransactionOrderByWithRelationInput | Prisma.SaleTransactionOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'vin':
        return { vehicle: { vin: sortOrder } };
      case 'buyer':
        return { buyer: { fullName: sortOrder } };
      case 'sale_price':
        return { salePrice: sortOrder };
      case 'payment_type':
        return { paymentType: sortOrder };
      case 'created_at':
        return { createdAt: sortOrder };
      case 'sale_date':
      default:
        return { saleDate: sortOrder };
    }
  }

  private subtractDays(date: Date, days: number) {
    return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
  }
}
