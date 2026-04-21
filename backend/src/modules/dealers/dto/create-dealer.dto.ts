import { IsDateString, IsString } from 'class-validator';

export class CreateDealerDto {
  @IsString()
  name!: string;

  @IsString()
  license_number!: string;

  @IsString()
  address!: string;

  @IsString()
  contact_info!: string;

  @IsDateString()
  approved_at!: string;
}
