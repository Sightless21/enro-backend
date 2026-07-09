import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  pricingPlanId: string;

  @IsString()
  @IsOptional()
  bookOptionId?: string;
}
