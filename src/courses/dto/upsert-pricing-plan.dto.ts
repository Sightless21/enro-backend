import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillingType } from '@prisma/client';

export class UpsertPricingPlanDto {
  @IsOptional()
  @IsString()
  id?: string; // มี id = update, ไม่มี = create ใหม่

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(BillingType)
  billingType: BillingType;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  installmentCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  savingAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
