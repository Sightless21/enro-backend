import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }
    return teacher;
  }

  async updateMyProfile(userId: string, data: UpdateTeacherProfileDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }
    return this.prisma.teacher.update({
      where: { userId },
      data,
    });
  }
}
