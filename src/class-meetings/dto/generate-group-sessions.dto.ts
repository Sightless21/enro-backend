import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';

export class GenerateGroupSessionsDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsDateString()
  startDate: string; // วันแรกที่เริ่มเรียน

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays: number[]; // 0=อาทิตย์ ... 6=เสาร์ ต้องมีจำนวนตรงกับ sessionsPerWeek ของคอร์ส

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMin?: number;
}
