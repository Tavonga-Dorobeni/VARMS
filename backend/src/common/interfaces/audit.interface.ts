import { AuditAction } from '@prisma/client';

export interface AuditMetadata {
  action: AuditAction;
  entityType: string;
  entityId: number;
  beforeValue?: unknown;
  afterValue?: unknown;
  reason?: string | null;
}

export interface AuditedResult<T> {
  data: T;
  audit?: AuditMetadata;
}
