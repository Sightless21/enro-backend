import { Test, TestingModule } from '@nestjs/testing';
import { ClassMeetingsController } from './class-meetings.controller';

describe('ClassMeetingsController', () => {
  let service: ClassMeetingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassMeetingsController],
    }).compile();

    service = module.get<ClassMeetingsController>(ClassMeetingsController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
