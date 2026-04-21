import { DealerStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdateDealerStatusDto {
  @IsEnum(DealerStatus)
  status!: DealerStatus;

  @IsString()
  reason!: string;
}
