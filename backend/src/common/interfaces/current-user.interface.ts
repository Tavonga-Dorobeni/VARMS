import { UserRole } from '@prisma/client';

export interface CurrentUser {
  userId: number;
  role: UserRole;
  agency: string;
  dealershipId?: number | null;
}
