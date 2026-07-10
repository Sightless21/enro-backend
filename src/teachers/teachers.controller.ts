import { Controller, Get, Patch, Body } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';

@Controller('teacher')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('me')
  @Roles('TEACHER')
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.teachersService.getMyProfile(userId);
  }

  @Patch('me')
  @Roles('TEACHER')
  updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: UpdateTeacherProfileDto,
  ) {
    return this.teachersService.updateMyProfile(userId, data);
  }
}
