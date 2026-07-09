import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { SubmitSlipDto } from './dto/submit-slip.dto';
import { InstallmentStatus } from '@prisma/client';
import dayjs from 'dayjs';
@Injectable()
export class InstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitSlip(installmentId: string, data: SubmitSlipDto, userId: string) {
    // find student by userId
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (!student) {
      throw new ForbiddenException(
        'This user does not have a student profile.',
      );
    }

    //find installment by id
    const installment = await this.prisma.installment.findUnique({
      where: { id: installmentId },
      include: { order: true },
    });
    if (!installment) {
      throw new ForbiddenException('Installment not found.');
    }
    if (installment.order.studentId !== student.id) {
      throw new ForbiddenException(
        'You do not have access to this installment',
      );
    }

    const notAllowedStatuses: InstallmentStatus[] = [
      InstallmentStatus.PENDING,
      InstallmentStatus.REJECTED,
    ];

    if (notAllowedStatuses.includes(installment.status)) {
      throw new BadRequestException(
        `Cannot submit slip for an installment with status "${installment.status}"`,
      );
    }

    return this.prisma.installment.update({
      where: { id: installmentId },
      data: {
        slipUrl: data.slipUrl,
        status: InstallmentStatus.WAITING_VERIFICATION,
      },
    });
  }

  async verify(installmentId: string, approve: boolean) {
    const installment = await this.prisma.installment.findUnique({
      where: { id: installmentId },
      include: { order: { include: { installments: true, course: true } } },
    });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }
    if (installment.status !== 'WAITING_VERIFICATION') {
      throw new BadRequestException(
        `Cannot verify an installment with status "${installment.status}"`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const update = await tx.installment.update({
        where: { id: installmentId },
        data: {
          status: approve ? 'PAID' : 'REJECTED',
          paidAt: approve ? new Date() : null,
        },
      });

      if (!approve) {
        return update; // ยังไม่ต้องเช็ค order สถานะ เพราะยังไม่จ่ายครบ
      }

      const remainingUnpaid = installment.order.installments.filter(
        (i) => i.id !== installmentId && i.status !== 'PAID',
      );

      if (remainingUnpaid.length === 0) {
        await tx.order.update({
          where: { id: installment.order.id },
          data: { status: 'COMPLETED' },
        });

        const course = installment.order.course;
        const expiresAt = course.durationMonths
          ? dayjs().add(course.durationMonths, 'month').toDate()
          : null;

        await tx.enrollment.create({
          data: {
            studentId: installment.order.studentId,
            courseId: installment.order.courseId,
            orderId: installment.order.id,
            expiresAt,
          },
        });
      }

      return update;
    });
  }
}
