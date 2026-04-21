import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreateSaleDto {
  @IsInt()
  vehicle_id!: number;

  @IsString()
  buyer_full_name!: string;

  @IsString()
  buyer_national_id!: string;

  @IsString()
  buyer_contact_details!: string;

  @IsNumber()
  sale_price!: number;

  @IsEnum(PaymentType)
  payment_type!: PaymentType;

  @IsString()
  proof_of_payment!: string;

  @IsDateString()
  sale_date!: string;

  @IsBoolean()
  is_acting_for_another!: boolean;

  @ValidateIf((o: CreateSaleDto) => o.is_acting_for_another)
  @IsString()
  beneficial_owner_full_name?: string;

  @ValidateIf((o: CreateSaleDto) => o.is_acting_for_another)
  @IsString()
  beneficial_owner_national_id?: string;

  @ValidateIf((o: CreateSaleDto) => o.is_acting_for_another)
  @IsString()
  beneficial_owner_relationship_type?: string;
}
