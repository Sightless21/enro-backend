import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CourseBookOption, Order, Prisma } from '@prisma/client';
import { CourseType } from '@prisma/client';
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateOrderDto) {
    const { courseId, pricingPlanId, bookOptionId } = data;

    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new BadRequestException(
        'This user does not have a student profile and cannot place an order.',
      );
    }
    const studentId = student.id;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course || !course.isActive) {
      throw new NotFoundException('Course not found or inactive');
    }

    const pricingPlan = await this.prisma.coursePricingPlan.findUnique({
      where: { id: pricingPlanId },
    });
    if (
      !pricingPlan ||
      pricingPlan.courseId !== courseId ||
      !pricingPlan.isActive
    ) {
      throw new BadRequestException('Invalid pricing plan for this course');
    }

    let bookOption: CourseBookOption | null = null;
    if (bookOptionId) {
      bookOption = await this.prisma.courseBookOption.findUnique({
        where: { id: bookOptionId },
      });
      if (!bookOption || bookOption.courseId !== courseId) {
        throw new BadRequestException('Invalid book option for this course');
      }
    }

    const totalAmount = pricingPlan.price + (bookOption?.price ?? 0);

    return this.createOrderWithCapacityCheck({
      studentId,
      courseId,
      pricingPlanId,
      bookOptionId,
      totalAmount,
      installmentCount: pricingPlan.installmentCount,
      courseType: course.type,
      maxCapacity: course.maxCapacity,
    });
  }

  async findAll() {
    return this.prisma.order.findMany();
  }

  /** แบ่งยอดรวมเป็นรายงวด งวดสุดท้ายรับเศษที่หารไม่ลงตัวไป (กันเงินหาย/เกินจากการปัดเศษ) */
  private splitAmountIntoInstallments(total: number, count: number): number[] {
    const base = Math.floor(total / count);
    const remainder = total % count;
    const amounts = new Array<number>(count).fill(base);
    amounts[count - 1] += remainder;
    return amounts;
  }

  private async createOrderWithCapacityCheck(params: {
    studentId: string;
    courseId: string;
    pricingPlanId: string;
    bookOptionId?: string;
    totalAmount: number;
    installmentCount: number;
    courseType: CourseType;
    maxCapacity: number | null;
  }): Promise<Order> {
    const {
      studentId,
      courseId,
      pricingPlanId,
      bookOptionId,
      totalAmount,
      installmentCount,
      courseType,
      maxCapacity,
    } = params;

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx): Promise<Order> => {
            if (courseType === 'GROUP' && maxCapacity != null) {
              const activeEnrollmentsCount = await tx.enrollment.count({
                where: { courseId, status: 'ACTIVE' },
              });

              if (activeEnrollmentsCount >= maxCapacity) {
                throw new BadRequestException(
                  `This group course is already fully booked with ${maxCapacity} applicants.`,
                );
              }
            }

            const order = await tx.order.create({
              data: {
                studentId,
                courseId,
                pricingPlanId,
                bookOptionId,
                totalAmount,
              },
            });

            const amounts = this.splitAmountIntoInstallments(
              totalAmount,
              installmentCount,
            );
            await tx.installment.createMany({
              data: amounts.map((amount, index) => ({
                orderId: order.id,
                seq: index + 1,
                amount,
              })),
            });

            return order;
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
      'Failed to create order after multiple attempts. Please try again.',
    );
  }
}
