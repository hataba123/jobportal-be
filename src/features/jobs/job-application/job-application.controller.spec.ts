import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';

describe('JobApplicationController', () => {
  let controller: JobApplicationController;
  let service: JobApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationController],
      providers: [
        {
          provide: JobApplicationService,
          useValue: {
            applyToJob: jest.fn(),
            getCandidatesForJob: jest.fn(),
            getMyAppliedJobs: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobApplicationController>(JobApplicationController);
    service = module.get<JobApplicationService>(JobApplicationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Thêm test cho từng endpoint nếu cần
});
