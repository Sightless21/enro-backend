import { Injectable } from '@nestjs/common';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { PrismaService } from '@prisma/prisma.service';
@Injectable()
export class CourseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCourseCategoryDto) {
    await this.prisma.courseCategory.create({
      data,
    });

    return { message: 'Course category created successfully' };
  }

  findAll() {
    return this.prisma.courseCategory.findMany();
  }

  findOne(id: string) {
    return this.prisma.courseCategory.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateCourseCategoryDto) {
    return this.prisma.courseCategory.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.courseCategory.delete({
      where: { id },
    });
  }
}
