import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Role, CourseType, ClassMeeting, Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { BookClassSessionDto } from './dto/book-class-session.dto';
import { GenerateGroupSessionsDto } from './dto/generate-group-sessions.dto';
import { isEnrollmentActive } from '@/common/utils/enrollment.util';

@Injectable()
export class ClassMeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async bookSession(userId: string, data: BookClassSessionDto) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new BadRequestException(
        'This user does not have a student profile.',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
      include: { course: true },
    });

    if (!enrollment || enrollment.studentId !== student.id) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }
    if (!isEnrollmentActive(enrollment)) {
      throw new BadRequestException(
        'This enrollment is not active or has expired',
      );
    }

    const allowEnrollmentStatus: CourseType[] = ['PRIVATE', 'FREESTYLE'];

    if (!allowEnrollmentStatus.includes(enrollment.course.type)) {
      throw new BadRequestException(
        'Self-booking is only available for Private/Freestyle courses',
      );
    }

    //TODO: assign ment
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: {
        teacherId_courseId: {
          teacherId: data.teacherId,
          courseId: enrollment.courseId,
        },
      },
    });
    if (!assignment || assignment.status !== 'ACTIVE') {
      throw new BadRequestException(
        'This teacher is not assigned to teach this course',
      );
    }
    const scheduledAt = new Date(data.scheduledAt);
    if (scheduledAt < new Date()) {
      throw new BadRequestException('Cannot book a session in the past');
    }
    const durationMin = data.durationMin ?? 60;

    return this.createMeetingWithOverlapCheck({
      courseId: enrollment.courseId,
      teacherId: data.teacherId,
      scheduledAt,
      durationMin,
      attendees: [{ enrollmentId: enrollment.id, studentId: student.id }],
    });
  }

  async generateGroupSessions(data: GenerateGroupSessionsDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course || course.type !== 'GROUP') {
      throw new BadRequestException('This course is not a Group course');
    }
    if (!course.totalSessions) {
      throw new BadRequestException(
        'This course does not have totalSessions defined',
      );
    }
    if (
      data.weekdays.length !== (course.sessionsPerWeek ?? data.weekdays.length)
    ) {
      throw new BadRequestException(
        `This course requires ${course.sessionsPerWeek} session(s) per week, but ${data.weekdays.length} weekday(s) were provided`,
      );
    }

    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: {
        teacherId_courseId: {
          teacherId: data.teacherId,
          courseId: data.courseId,
        },
      },
    });
    if (!assignment || assignment.status !== 'ACTIVE') {
      throw new BadRequestException(
        'This teacher is not assigned to teach this course',
      );
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: data.courseId, status: 'ACTIVE' },
    });
    if (enrollments.length === 0) {
      throw new BadRequestException(
        'No active enrollments found for this course',
      );
    }

    const existingCount = await this.prisma.classMeeting.count({
      where: { courseId: data.courseId },
    });
    if (existingCount > 0) {
      throw new BadRequestException(
        'Sessions have already been generated for this course. Generating again would create duplicates.',
      );
    }

    const dates = this.computeScheduleDates(
      new Date(data.startDate),
      data.weekdays,
      course.totalSessions,
    );
    const durationMin =
      data.durationMin ??
      (course.hoursPerSession ? Math.round(course.hoursPerSession * 60) : 60);

    return this.prisma.$transaction(async (tx) => {
      const meetings = await Promise.all(
        dates.map((scheduledAt) =>
          tx.classMeeting.create({
            data: {
              courseId: data.courseId,
              teacherId: data.teacherId,
              scheduledAt,
              durationMin,
            },
          }),
        ),
      );

      const attendanceRows = meetings.flatMap((meeting) =>
        enrollments.map((enrollment) => ({
          classMeetingId: meeting.id,
          enrollmentId: enrollment.id,
          studentId: enrollment.studentId,
        })),
      );

      await tx.classAttendance.createMany({ data: attendanceRows });

      return {
        message: `Generated ${meetings.length} meetings for ${enrollments.length} student(s) (${attendanceRows.length} attendance records total)`,
      };
    });
  }

  async addStudentToExistingMeetings(
    courseId: string,
    enrollmentId: string,
    studentId: string,
  ) {
    const upcomingMeetings = await this.prisma.classMeeting.findMany({
      where: { courseId, status: 'SCHEDULED', scheduledAt: { gt: new Date() } },
    });

    if (upcomingMeetings.length === 0)
      return { message: 'No upcoming meetings to join' };

    await this.prisma.classAttendance.createMany({
      data: upcomingMeetings.map((m) => ({
        classMeetingId: m.id,
        enrollmentId,
        studentId,
      })),
      skipDuplicates: true,
    });

    return {
      message: `Added to ${upcomingMeetings.length} upcoming meeting(s)`,
    };
  }

  private computeScheduleDates(
    startDate: Date,
    weekdays: number[],
    totalSessions: number,
  ): Date[] {
    const sortedWeekdays = [...weekdays].sort((a, b) => a - b);
    const dates: Date[] = [];
    const cursor = new Date(startDate);

    while (dates.length < totalSessions) {
      if (sortedWeekdays.includes(cursor.getDay())) {
        dates.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  async findMySessionsAsStudent(userId: string) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new BadRequestException(
        'This user does not have a student profile.',
      );
    }

    return this.prisma.classAttendance.findMany({
      where: { studentId: student.id },
      include: {
        classMeeting: {
          include: {
            course: { select: { id: true, title: true } },
            teacher: { select: { id: true, nickname: true } },
          },
        },
      },
      orderBy: { classMeeting: { scheduledAt: 'desc' } },
    });
  }

  async findMySessionsAsTeacher(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) {
      throw new BadRequestException(
        'This user does not have a teacher profile.',
      );
    }

    return this.prisma.classMeeting.findMany({
      where: { teacherId: teacher.id },
      include: {
        course: { select: { id: true, title: true } },
        attendances: {
          include: {
            student: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findByEnrollment(enrollmentId: string) {
    return this.prisma.classAttendance.findMany({
      where: { enrollmentId },
      include: {
        classMeeting: {
          include: { teacher: { select: { id: true, nickname: true } } },
        },
      },
      orderBy: { classMeeting: { scheduledAt: 'asc' } },
    });
  }

  async findOne(attendanceId: string, userId: string, role: Role) {
    const attendance = await this.prisma.classAttendance.findUnique({
      where: { id: attendanceId },
      include: {
        classMeeting: { include: { course: true, teacher: true } },
        student: { select: { id: true, userId: true } },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Class attendance not found');
    }

    if (role === 'ADMIN') return attendance;
    if (role === 'STUDENT' && attendance.student.userId === userId)
      return attendance;
    if (
      role === 'TEACHER' &&
      attendance.classMeeting.teacher?.userId === userId
    )
      return attendance;

    throw new ForbiddenException(
      'You do not have access to this class session',
    );
  }

  /** สร้าง ClassMeeting + ClassAttendance พร้อมกัน กันครูโดนจองซ้อน */
  private async createMeetingWithOverlapCheck(params: {
    courseId: string;
    teacherId: string;
    scheduledAt: Date;
    durationMin: number;
    attendees: { enrollmentId: string; studentId: string }[];
  }): Promise<ClassMeeting> {
    const { courseId, teacherId, scheduledAt, durationMin, attendees } = params;
    const sessionEnd = new Date(scheduledAt.getTime() + durationMin * 60_000);

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx): Promise<ClassMeeting> => {
            const teacherMeetings = await tx.classMeeting.findMany({
              where: {
                teacherId,
                status: 'SCHEDULED',
                scheduledAt: { lt: sessionEnd },
              },
              select: { scheduledAt: true, durationMin: true },
            });

            const hasOverlap = teacherMeetings.some((m) => {
              const existingEnd = new Date(
                m.scheduledAt.getTime() + m.durationMin * 60_000,
              );
              return existingEnd > scheduledAt;
            });
            if (hasOverlap) {
              throw new BadRequestException(
                'This teacher already has a session booked at this time',
              );
            }

            const meeting = await tx.classMeeting.create({
              data: { courseId, teacherId, scheduledAt, durationMin },
            });

            await tx.classAttendance.createMany({
              data: attendees.map((a) => ({
                classMeetingId: meeting.id,
                enrollmentId: a.enrollmentId,
                studentId: a.studentId,
              })),
            });

            return meeting;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (err) {
        const isSerializationConflict =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2034';
        if (!isSerializationConflict || attempt === MAX_RETRIES) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
      }
    }

    throw new BadRequestException(
      'Failed to book session after multiple attempts. Please try again.',
    );
  }
}
