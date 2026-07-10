import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findMyEnrollments(userId: string) {
    // TODO: Implement
  }

  async findOne(userId: string, enrollmentId: string, isAdmin: boolean) {
    // TODO: Implement
  }

  async findByCourse(courseId: string) {
    // TODO: Implement
  }
}
