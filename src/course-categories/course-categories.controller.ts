import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { Roles } from '@/auth/decorator/roles.decorator';

@Roles('ADMIN')
@Controller('course-categories')
export class CourseCategoriesController {
  constructor(
    private readonly courseCategoriesService: CourseCategoriesService,
  ) {}

  @Post()
  create(@Body() data: CreateCourseCategoryDto) {
    return this.courseCategoriesService.create(data);
  }

  @Get()
  findAll() {
    return this.courseCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateCourseCategoryDto) {
    return this.courseCategoriesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseCategoriesService.remove(id);
  }
}
