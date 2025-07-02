// Unit test cho RecruiterDashboardController
import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterDashboardController } from './dashboard.controller';
import { RecruiterDashboardService } from './dashboard.service';

describe('RecruiterDashboardController', () => {
  let controller: RecruiterDashboardController;
  let service: RecruiterDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruiterDashboardController],
      providers: [
        {
          provide: RecruiterDashboardService,
          useValue: {
            getDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecruiterDashboardController>(
      RecruiterDashboardController,
    );
    service = module.get<RecruiterDashboardService>(RecruiterDashboardService);
  });

  it('should return dashboard data', async () => {
    const mockDashboard = {
      totalJobPosts: 2,
      totalApplicants: 5,
      recentJobPosts: [],
      recentApplicants: [],
    };
    jest.spyOn(service, 'getDashboard').mockResolvedValue(mockDashboard as any);
    expect(await controller.getDashboard('recruiter-id')).toEqual(
      mockDashboard,
    );
  });
});
