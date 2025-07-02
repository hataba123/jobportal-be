import { Test, TestingModule } from '@nestjs/testing';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';

describe('JobPostController', () => {
  let controller: JobPostController;
  let service: JobPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobPostController],
      providers: [
        {
          provide: JobPostService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn(),
            getByEmployer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobPostController>(JobPostController);
    service = module.get<JobPostService>(JobPostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Thêm test cho từng endpoint nếu cần
});
