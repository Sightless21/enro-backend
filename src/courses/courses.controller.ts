import { Controller, Get, Post, Delete, Patch } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-courses.dto';
import { UpdateCourseDto } from './dto/update-courses.dto';
import { Param } from '@nestjs/common';
import { Body } from '@nestjs/common';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateCourseDto) {
    return this.coursesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateCourseDto) {
    return this.coursesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
