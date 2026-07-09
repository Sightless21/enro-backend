import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCourseDto } from './dto/create-courses.dto';
import { UpdateCourseDto } from './dto/update-courses.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany();
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async create(data: CreateCourseDto) {
    const { pricingPlans, bookOptions, categoryId, ...courseData } = data;

    if (categoryId) {
      const category = await this.prisma.courseCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
    }

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        categoryId,
        pricingPlans: { create: pricingPlans },
        bookOptions: bookOptions ? { create: bookOptions } : undefined,
      },
    });

    return { message: `Course ${course.title} created successfully` };
  }

  async update(id: string, data: UpdateCourseDto) {
    const { pricingPlans, bookOptions, categoryId, ...courseData } = data;

    const plansToUpdate = pricingPlans?.filter((p) => p.id) ?? [];
    const plansToCreate = pricingPlans?.filter((p) => !p.id) ?? [];

    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...courseData,
        categoryId,
        pricingPlans: pricingPlans
          ? {
              create: plansToCreate.map((plan) => ({
                name: plan.name,
                billingType: plan.billingType,
                price: plan.price,
                installmentCount: plan.installmentCount,
                savingAmount: plan.savingAmount,
                isActive: plan.isActive,
              })),
              update: plansToUpdate.map((plan) => ({
                where: { id: plan.id },
                data: {
                  name: plan.name,
                  billingType: plan.billingType,
                  price: plan.price,
                  installmentCount: plan.installmentCount,
                  savingAmount: plan.savingAmount,
                  isActive: plan.isActive,
                },
              })),
            }
          : undefined,
        bookOptions: bookOptions
          ? {
              upsert: bookOptions.map((book) => ({
                where: { courseId_type: { courseId: id, type: book.type } },
                create: { type: book.type, price: book.price },
                update: { price: book.price },
              })),
            }
          : undefined,
      },
    });

    return { message: `Course ${course.title} updated successfully` };
  }

  async remove(id: string) {
    const course = await this.prisma.course.delete({
      where: { id },
    });

    return {
      message: `Course ${course.title} deleted successfully`,
    };
  }

  async activated(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { isActive: true },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return { message: `Course ${course.title} activated successfully` };
  }

  async deactivate(id: string) {
    const course = await this.prisma.course.update({
      where: { id },
      data: { isActive: false },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return { message: `Course ${course.title} deactivated successfully` };
  }
}
