import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BookType } from '@prisma/client';

export class UpsertBookOptionDto {
  @IsEnum(BookType)
  type: BookType; // ใช้เป็น key คู่กับ courseId ในการ upsert

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number;
}
