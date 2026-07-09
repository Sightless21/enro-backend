import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class VerifyInstallmentDto {
  @IsBoolean()
  approve: boolean;

  @IsOptional()
  @IsString()
  rejectReason?: string; // เก็บไว้เผื่ออนาคต ตอนนี้ยังไม่มี field ใน schema รองรับ
}
