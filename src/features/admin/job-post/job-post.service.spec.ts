import { Test, TestingModule } from '@nestjs/testing';
import { JobPostService } from './job-post.service';
import { PrismaService } from 'src/prisma/prisma.service';

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
            jobPost: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
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

  // Thêm test cho từng method nếu cần
});
