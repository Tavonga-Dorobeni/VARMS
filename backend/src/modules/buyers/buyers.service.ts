import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class BuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async getBeneficialOwners(buyerId: number) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { id: buyerId },
      include: { beneficialOwners: true },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    return buyer.beneficialOwners.map((owner) => ({
      id: owner.id,
      linked_buyer_id: owner.linkedBuyerId,
      full_name: owner.fullName,
      national_id: owner.nationalId,
      relationship_type: owner.relationshipType,
      created_at: owner.createdAt,
      updated_at: owner.updatedAt,
    }));
  }
}
