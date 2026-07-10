import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { JlptLevel } from '@prisma/client';

export class UpdateTeacherProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialty?: string;

  @IsOptional()
  @IsEnum(JlptLevel)
  jlptLevel?: JlptLevel;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  // ไม่มี employeeCode, hireDate, note — เป็น field ฝั่ง HR/admin เท่านั้น
}
