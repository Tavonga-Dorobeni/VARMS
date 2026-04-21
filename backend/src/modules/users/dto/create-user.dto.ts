import { UserRole, UserStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  full_name!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  agency!: string;

  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsInt()
  dealership_id?: number;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
