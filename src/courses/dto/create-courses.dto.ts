import { Type } from 'class-transformer';
import {
  MinLength,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { CourseType, CourseFormat, JlptLevel } from '@prisma/client';
import { CreatePricingPlanDto } from './create-pricing-plan.dto';
import { CreateBookOptionDto } from './create-book-option.dto';

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  title: string;

  @IsEnum(CourseType)
  type: CourseType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;

  @IsOptional()
  @IsEnum(CourseFormat)
  format?: CourseFormat;

  @IsOptional()
  @IsEnum(JlptLevel)
  level?: JlptLevel;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sessionsPerWeek?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  hoursPerSession?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalSessions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCapacity?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePricingPlanDto)
  pricingPlans: CreatePricingPlanDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookOptionDto)
  bookOptions?: CreateBookOptionDto[]; // optional เพราะบางคอร์สไม่มีหนังสือขาย
}
