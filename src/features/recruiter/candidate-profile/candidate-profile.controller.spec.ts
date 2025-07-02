import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterCandidateProfileController } from './candidate-profile.controller';
import { RecruiterCandidateService } from './candidate-profile.service';

describe('RecruiterCandidateProfileController', () => {
  let controller: RecruiterCandidateProfileController;
  let service: RecruiterCandidateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruiterCandidateProfileController],
      providers: [
        {
          provide: RecruiterCandidateService,
          useValue: {
            searchCandidates: jest.fn(),
            getCandidateById: jest.fn(),
            getCandidateApplications: jest.fn(),
            getCandidatesForRecruiter: jest.fn(),
            getByUserId: jest.fn(),
            update: jest.fn(),
            uploadCv: jest.fn(),
            deleteCv: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecruiterCandidateProfileController>(
      RecruiterCandidateProfileController,
    );
    service = module.get<RecruiterCandidateService>(RecruiterCandidateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Thêm test cho từng endpoint nếu cần
});
