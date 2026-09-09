import { Test, TestingModule } from '@nestjs/testing';
import { JobPostService } from './job-post.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('JobPostService', () => {
  let service: JobPostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobPostService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              findUnique: jest.fn().mockResolvedValue({ id: 'category-1' }),
            },
            jobPost: {
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<JobPostService>(JobPostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('does not allow a recruiter to create an active job post', async () => {
    await expect(
      service.create('employer-1', {
        categoryId: 'category-1',
        title: 'Job',
        description: 'Description',
        location: 'Hà Nội',
        salary: 1000,
        status: 'Active',
      } as any),
    ).rejects.toThrow('Draft hoặc PendingApproval');
    expect(prisma.jobPost.create).not.toHaveBeenCalled();
  });

  // Thêm các test case cho từng method nếu cần
});
