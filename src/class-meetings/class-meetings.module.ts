import { Module } from '@nestjs/common';
import { ClassMeetingsController } from './class-meetings.controller';
import { ClassMeetingsService } from './class-meetings.service';

@Module({
  controllers: [ClassMeetingsController],
  providers: [ClassMeetingsService],
})
export class ClassMeetingsModule {}
