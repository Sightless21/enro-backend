import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { BillingType } from '@prisma/client';

export class CreatePricingPlanDto {
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
  installmentCount?: number; // ไม่ส่ง = ใช้ default 1 ของ Prisma (จ่ายครั้งเดียว/งวดเดียว)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  savingAmount?: number;
}
