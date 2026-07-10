import { Controller, Get, Param } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CurrentUser } from '@/auth/decorator/current-user.decorator';
import { Roles } from '@/auth/decorator/roles.decorator';
import { Role } from '@prisma/client';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @Roles('STUDENT')
  findMyEnrollments(@CurrentUser('sub') userId: string) {
    return this.enrollmentsService.findMyEnrollments(userId);
  }

  @Get('by-course/:courseId')
  @Roles('ADMIN')
  findByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get(':id')
  @Roles('STUDENT', 'ADMIN')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.enrollmentsService.findOne(id, userId, role === 'ADMIN');
  }
}
