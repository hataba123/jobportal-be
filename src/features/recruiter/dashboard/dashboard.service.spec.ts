// Unit test cho RecruiterDashboardService
import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterDashboardService } from './dashboard.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('RecruiterDashboardService', () => {
  let service: RecruiterDashboardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruiterDashboardService,
        {
          provide: PrismaService,
          useValue: {
            jobPost: {
              findMany: jest.fn(),
            },
            jobApplication: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecruiterDashboardService>(RecruiterDashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return dashboard data', async () => {
    (prisma.jobPost.findMany as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Job 1', createdAt: new Date(), applicants: [1, 2] },
      { id: '2', title: 'Job 2', createdAt: new Date(), applicants: [3] },
    ]);
    (prisma.job.count as jest.Mock).mockResolvedValue(3);
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);
    const result = await service.getDashboard('recruiter-id');
    expect(result.totalJobPosts).toBe(2);
    expect(result.totalApplicants).toBe(3);
    expect(Array.isArray(result.recentJobPosts)).toBe(true);
    expect(Array.isArray(result.recentApplicants)).toBe(true);
  });
});
