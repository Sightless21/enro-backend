import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  role: Role;
}
