import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';

@Injectable()
export class ClassSessionsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findMySessionsAsStudent(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      throw new BadRequestException(
        'This user does not have a student profile.',
      );
    }

    return await this.prisma.classSession.findMany({
      where: { studentId: student.id },
      include: {
        enrollment: {
          include: { course: { select: { id: true, title: true } } },
        },
        teacher: { select: { id: true, nickname: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findMySessionsAsTeacher(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new BadRequestException(
        'This user does not have a teacher profile.',
      );
    }

    return this.prisma.classSession.findMany({
      where: { teacherId: teacher.id },
      include: {
        enrollment: {
          include: { course: { select: { id: true, title: true } } },
        },
        student: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findByEnrollment(enrollmentId: string) {
    return this.prisma.classSession.findMany({
      where: { enrollmentId },
      include: {
        teacher: { select: { id: true, nickname: true } },
        student: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(sessionId: string, userId: string, role: Role) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        enrollment: { include: { course: true } },
        student: { select: { id: true, userId: true } },
        teacher: { select: { id: true, userId: true, nickname: true } },
      },
    });

    if (!session) {
      throw new BadRequestException('Class session not found');
    }

    if (role === 'ADMIN') {
      return session;
    }
    if (role === 'STUDENT' && session.student.userId === userId) {
      return session;
    }
    if (role === 'TEACHER' && session.teacher?.userId === userId) {
      return session;
    }

    throw new BadRequestException(
      'You do not have access to this class session',
    );
  }
}
