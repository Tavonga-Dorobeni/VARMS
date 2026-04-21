import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export interface AuditDecoratorMetadata {
  action: AuditAction;
  entityType: string;
}

export const AUDIT_KEY = 'audit';
export const Audit = (action: AuditAction, entityType: string) =>
  SetMetadata(AUDIT_KEY, { action, entityType } satisfies AuditDecoratorMetadata);
