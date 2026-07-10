import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  school?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  // ไม่มี studentCode, note ใน DTO นี้โดยตั้งใจ — เป็น field ที่ admin/staff ดูแลเท่านั้น
}
