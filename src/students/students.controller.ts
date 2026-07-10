import { Body, Controller, Get, Patch } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { Roles } from '@/auth/decorator/roles.decorator';

@Controller('student')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @Roles('STUDENT')
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.studentsService.getMyProfile(userId);
  }

  @Patch('me')
  @Roles('STUDENT')
  updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: UpdateStudentProfileDto,
  ) {
    return this.studentsService.updateMyProfile(userId, data);
  }
}
