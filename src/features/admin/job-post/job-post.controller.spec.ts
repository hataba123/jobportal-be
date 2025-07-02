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
            getAllJobPosts: jest.fn(),
            getJobPostById: jest.fn(),
            createJobPost: jest.fn(),
            updateJobPost: jest.fn(),
            deleteJobPost: jest.fn(),
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
