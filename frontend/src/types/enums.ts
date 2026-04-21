export enum UserRole {
  ZIMRA_OFFICER = 'ZIMRA_OFFICER',
  DEALER = 'DEALER',
  CVR_OFFICER = 'CVR_OFFICER',
  FIU_ANALYST = 'FIU_ANALYST',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum DealerStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
}

export enum VehicleStatus {
  CLEARED = 'CLEARED',
  INVENTORY = 'INVENTORY',
  SOLD = 'SOLD',
  REGISTERED = 'REGISTERED',
  STR_FLAGGED = 'STR_FLAGGED',
}

export enum PaymentType {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FINANCE = 'FINANCE',
}

export enum StrSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum StrStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  DISMISSED = 'DISMISSED',
  ESCALATED = 'ESCALATED',
}

export enum RegistrationStatus {
  APPROVED = 'APPROVED',
  BLOCKED = 'BLOCKED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum LifecycleStage {
  BORDER_ENTRY = 'BORDER_ENTRY',
  DEALER_INVENTORY = 'DEALER_INVENTORY',
  PENDING_SALE = 'PENDING_SALE',
  CVR_REGISTERED = 'CVR_REGISTERED',
}
