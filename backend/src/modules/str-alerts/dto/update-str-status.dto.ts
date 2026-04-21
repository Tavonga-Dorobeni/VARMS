import { StrStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdateStrStatusDto {
  @IsEnum(StrStatus)
  status!: StrStatus;

  @IsString()
  reason!: string;
}
