import { Module } from '@nestjs/common';
import { TeachersController } from './teacher.controller';
import { TeachersService } from './teacher.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
