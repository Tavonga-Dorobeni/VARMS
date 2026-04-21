import { IsOptional, IsString } from 'class-validator';

export class RegistrationSearchDto {
  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  ref?: string;

  @IsString()
  national_id!: string;
}
