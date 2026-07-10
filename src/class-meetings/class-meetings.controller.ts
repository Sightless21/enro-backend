import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ClassMeetingsService } from './class-meetings.service';
import { BookClassSessionDto } from './dto/book-class-session.dto';
import { GenerateGroupSessionsDto } from './dto/generate-group-sessions.dto';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('class-sessions')
export class ClassMeetingsController {
  constructor(private readonly classSessionsService: ClassMeetingsService) {}

  @Post('book')
  @Roles('STUDENT')
  bookSession(
    @CurrentUser('sub') userId: string,
    @Body() data: BookClassSessionDto,
  ) {
    return this.classSessionsService.bookSession(userId, data);
  }

  @Post('generate-group')
  @Roles('ADMIN')
  generateGroupSessions(@Body() data: GenerateGroupSessionsDto) {
    return this.classSessionsService.generateGroupSessions(data);
  }

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
  findByEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.classSessionsService.findByEnrollment(enrollmentId);
  }

  @Get(':id')
  @Roles('STUDENT', 'TEACHER', 'ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.classSessionsService.findOne(id, userId, role);
  }
}
