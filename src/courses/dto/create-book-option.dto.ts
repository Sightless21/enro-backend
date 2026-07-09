import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { BookType } from '@prisma/client';

export class CreateBookOptionDto {
  @IsEnum(BookType)
  type: BookType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number; // ไม่ส่งมา = รวมในคอร์สแล้ว ไม่มีค่าใช้จ่ายเพิ่ม
}
