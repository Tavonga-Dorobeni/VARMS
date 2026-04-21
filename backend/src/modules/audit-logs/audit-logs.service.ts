import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../common/services/prisma.service';
import { normalizePagination } from '../../common/utils/pagination.util';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQueryDto & Record<string, string | undefined>) {
    const { page, limit, skip } = normalizePagination(query);
    const where: Prisma.AuditLogWhereInput = {};

    if (query.user_id) where.userId = Number(query.user_id);
    if (query.role) where.role = query.role;
    if (query.action) where.action = query.action as never;
    if (query.entity_type) where.entityType = query.entity_type;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { timestamp: query.sort_order ?? 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        user_id: item.userId,
        user: item.user.fullName,
        role: item.role,
        action: item.action,
        entity_type: item.entityType,
        entity_id: item.entityId,
        before_value: item.beforeValue,
        after_value: item.afterValue,
        reason: item.reason,
        timestamp: item.timestamp,
        created_at: item.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async export(query: PaginationQueryDto & Record<string, string | undefined>) {
    const data = await this.list(query);
    return {
      filename: `audit-logs-${Date.now()}.csv`,
      content: stringify(data.items, { header: true }),
    };
  }
}
