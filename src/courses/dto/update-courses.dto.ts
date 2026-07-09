import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCourseDto } from './create-courses.dto';
import { UpsertPricingPlanDto } from './upsert-pricing-plan.dto';
import { UpsertBookOptionDto } from './upsert-book-option.dto';

export class UpdateCourseDto extends PartialType(
  OmitType(CreateCourseDto, ['pricingPlans', 'bookOptions'] as const),
) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertPricingPlanDto)
  pricingPlans?: UpsertPricingPlanDto[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertBookOptionDto)
  bookOptions?: UpsertBookOptionDto[];
}
