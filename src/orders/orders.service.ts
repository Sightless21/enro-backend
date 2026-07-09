import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // async createOrder(studentId: string, courseId: string) {
  //   const course = await this.prisma.course.findUnique({
  //     where: { id: courseId },
  //   });

  //   if (course?.type === 'GROUP') {
  //     const activeEnrollmentsCount = await this.prisma.enrollment.count({
  //       where: {
  //         courseId: courseId,
  //         status: 'ACTIVE',
  //       },
  //     });

  //     if (course.maxCapacity && activeEnrollmentsCount >= course.maxCapacity) {
  //       throw new BadRequestException(
  //         `This group course is already fully booked with ${course.maxCapacity} applicants.`,
  //       );
  //     }

  //     return this.prisma.order.create({
  //       data: { studentId, courseId, totalAmount: course.price },
  //     });
  //   }
  // }
}
