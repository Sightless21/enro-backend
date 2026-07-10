import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaClient) {}

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

    return this.syncExpiredStatus(enrollments);
  }

  async findOne(enrollmentId: string, userId: string, isAdmin: boolean) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        student: { select: { id: true, userId: true } },
        classSessions: { orderBy: { id: 'asc' } },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    if (!isAdmin && enrollment.student.userId !== userId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    const [synced] = await this.syncExpiredStatus([enrollment]);
    return synced;
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
    return this.syncExpiredStatus(enrollments);
  }

  /**
   * Lazy expiry: ไม่มี background job ตอนนี้ (ตาม YAGNI ที่คุยกันไว้)
   * เช็คตอน query แทน — ถ้าเจอ enrollment ที่หมดอายุแต่สถานะยังเป็น ACTIVE
   * ให้ update เป็น EXPIRED ทันทีก่อน return
   */
  private async syncExpiredStatus<
    T extends { id: string; status: string; expiresAt: Date | null },
  >(enrollments: T[]): Promise<T[]> {
    const now = new Date();
    const toExpire = enrollments.filter(
      (e) => e.status === 'ACTIVE' && e.expiresAt && e.expiresAt < now,
    );

    if (toExpire.length > 0) {
      await this.prisma.enrollment.updateMany({
        where: { id: { in: toExpire.map((e) => e.id) } },
        data: { status: 'EXPIRED' },
      });
    }

    return enrollments.map((e) =>
      toExpire.some((x) => x.id === e.id) ? { ...e, status: 'EXPIRED' } : e,
    );
  }
}
