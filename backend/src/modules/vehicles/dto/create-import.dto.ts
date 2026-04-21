import { IsDateString, IsInt, IsNumber, IsString } from 'class-validator';

export class CreateImportDto {
  @IsString()
  vin!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsNumber()
  declared_value!: number;

  @IsString()
  country_of_origin!: string;

  @IsDateString()
  import_date!: string;

  @IsInt()
  dealership_id!: number;

  @IsString()
  border_post!: string;
}
