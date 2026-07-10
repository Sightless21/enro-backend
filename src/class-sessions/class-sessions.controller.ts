import { Controller, Get, Param } from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';
import { Role } from '@prisma/client';
@Controller('class-sessions')
export class ClassSessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @Get('my/student')
  @Roles('STUDENT')
  findMySessionsAsStudent(@CurrentUser('sub') userId: string) {
    return this.classSessionsService.findMySessionsAsStudent(userId);
  }

  @Get('my/teacher')
  @Roles('TEACHER')
  findMySessionsAsTeacher(@CurrentUser('sub') userId: string) {
    return this.classSessionsService.findMySessionsAsTeacher(userId);
  }

  @Get('by-enrollment/:enrollmentId')
  @Roles('ADMIN')
  findSessionsByEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.classSessionsService.findByEnrollment(enrollmentId);
  }

  @Get(':id')
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.classSessionsService.findOne(userId, id, role);
  }
}
