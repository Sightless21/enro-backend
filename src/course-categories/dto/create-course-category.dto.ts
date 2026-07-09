import { IsString, IsEnum } from 'class-validator';
import { CourseType } from '@prisma/client';
export class CreateCourseCategoryDto {
  @IsString()
  name: string;

  @IsEnum(CourseType)
  type: CourseType;
}
