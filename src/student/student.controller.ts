import { Controller, Get, Patch } from '@nestjs/common';
import { StudentService } from './student.service';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { Roles } from '@/auth/decorator/roles.decorator';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  @Roles('STUDENT')
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.studentService.getMyProfile(userId);
  }

  @Patch('me')
  @Roles('STUDENT')
  updateMyProfile(
    @CurrentUser('sub') userId: string,
    data: UpdateStudentProfileDto,
  ) {
    return this.studentService.updateMyProfile(userId, data);
  }
}
