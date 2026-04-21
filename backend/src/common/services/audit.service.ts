import { Injectable } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { PrismaService } from './prisma.service';

interface LogAuditParams {
  userId: number;
  role: UserRole;
  action: AuditAction;
  entityType: string;
  entityId: number;
  beforeValue?: unknown;
  afterValue?: unknown;
  reason?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogAuditParams) {
    await this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        role: params.role,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        beforeValue: params.beforeValue as object | undefined,
        afterValue: params.afterValue as object | undefined,
        reason: params.reason ?? null,
        timestamp: new Date(),
      },
    });
  }
}
