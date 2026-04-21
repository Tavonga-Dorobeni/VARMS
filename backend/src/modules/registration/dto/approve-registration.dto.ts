import { IsDateString, IsInt, IsString } from 'class-validator';

export class ApproveRegistrationDto {
  @IsInt()
  vehicle_id!: number;

  @IsString()
  national_id!: string;

  @IsDateString()
  registration_date!: string;
}
