import { CreateAdminDto } from './create-admin.dto';
import { PickType, PartialType } from '@nestjs/mapped-types';

export class UpdateUsersDto extends PartialType(
  PickType(CreateAdminDto, ['email', 'name', 'role'] as const),
) {}
