import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { isEnrollmentActive } from '@/common/utils/enrollment.util';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyEnrollments(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new BadRequestException(
        'This user does not have a student profile.',
      );
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: { select: { id: true, title: true, type: true, level: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((e) => ({ ...e, isActive: isEnrollmentActive(e) }));
  }

  async findOne(enrollmentId: string, userId: string, isAdmin: boolean) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        student: { select: { id: true, userId: true } },
        classAttendances: {
          include: {
            classMeeting: {
              include: { teacher: { select: { id: true, nickname: true } } },
            },
          },
          orderBy: { classMeeting: { scheduledAt: 'asc' } },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    if (!isAdmin && enrollment.student.userId !== userId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    return { ...enrollment, isActive: isEnrollmentActive(enrollment) };
  }

  async findByCourse(courseId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    return enrollments.map((e) => ({ ...e, isActive: isEnrollmentActive(e) }));
  }
}
