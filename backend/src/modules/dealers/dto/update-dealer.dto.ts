import { IsOptional, IsString } from 'class-validator';

export class UpdateDealerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contact_info?: string;

  @IsString()
  reason!: string;
}
