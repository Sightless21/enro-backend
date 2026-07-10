import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '@/auth/decorator/roles.decorator';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateAdminDto) {
    return this.usersService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUsersDto) {
    return this.usersService.update(id, data);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto);
  }
}
