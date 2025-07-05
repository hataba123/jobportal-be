import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationService } from './job-application.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('JobApplicationService', () => {
  let service: JobApplicationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationService,
        {
          provide: PrismaService,
          useValue: {
            job: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            jobPost: { findUnique: jest.fn(), findFirst: jest.fn() },
            candidateProfile: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();
    service = module.get<JobApplicationService>(JobApplicationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Thêm các test case cho từng method nếu cần
});
