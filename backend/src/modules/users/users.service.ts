import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuditAction, Prisma, UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    await this.ensureDealerLinkage(dto.role, dto.dealership_id);

    const created = await this.prisma.user.create({
      data: {
        fullName: dto.full_name,
        role: dto.role,
        agency: dto.agency,
        username: dto.username,
        passwordHash: await bcrypt.hash(dto.password, 10),
        dealershipId: dto.dealership_id,
        status: dto.status ?? 'ACTIVE',
      },
    });

    return {
      data: this.toResponse(created),
      audit: {
        action: AuditAction.CREATE,
        entityType: 'user',
        entityId: created.id,
        afterValue: this.toResponse(created),
      },
    };
  }

  async list(query: PaginationQueryDto) {
    const { page, limit, skip } = normalizePagination(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: query.sort_order ?? 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const nextRole = dto.role ?? existing.role;
    const nextDealerId = dto.dealership_id !== undefined ? dto.dealership_id : existing.dealershipId;
    await this.ensureDealerLinkage(nextRole, nextDealerId ?? undefined);

    const data: Prisma.UserUncheckedUpdateInput = {
      fullName: dto.full_name,
      role: dto.role,
      agency: dto.agency,
      username: dto.username,
      dealershipId: dto.dealership_id,
      status: dto.status,
    };

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return {
      data: this.toResponse(updated),
      audit: {
        action: AuditAction.UPDATE,
        entityType: 'user',
        entityId: updated.id,
        beforeValue: this.toResponse(existing),
        afterValue: this.toResponse(updated),
        reason: dto.reason,
      },
    };
  }

  private async ensureDealerLinkage(role: UserRole, dealershipId?: number | null) {
    if (role === 'DEALER' && !dealershipId) {
      throw new BadRequestException('Dealer users must be linked to a dealership');
    }

    if (dealershipId) {
      const dealer = await this.prisma.dealer.findUnique({ where: { id: dealershipId } });
      if (!dealer) {
        throw new BadRequestException('Linked dealership not found');
      }
    }
  }

  private toResponse(user: {
    id: number;
    fullName: string;
    role: UserRole;
    agency: string;
    username: string;
    dealershipId: number | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      full_name: user.fullName,
      role: user.role,
      agency: user.agency,
      username: user.username,
      dealership_id: user.dealershipId,
      status: user.status,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
