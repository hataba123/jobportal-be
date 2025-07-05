// Unit test cho RecruiterCompanyService
import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterCompanyService } from './company.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('RecruiterCompanyService', () => {
  let service: RecruiterCompanyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruiterCompanyService,
        {
          provide: PrismaService,
          useValue: {
            jobPost: {
              findFirst: jest.fn(),
              count: jest.fn(),
            },
            company: {
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecruiterCompanyService>(RecruiterCompanyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Test lấy công ty
  it('should return company dto', async () => {
    const mockCompany = { id: 'uuid', name: 'Test', openJobs: 0, rating: 0 };
    (prisma.jobPost.findFirst as jest.Mock).mockResolvedValue({
      company: mockCompany,
    });
    const result = await service.getMyCompany('recruiter-id');
    expect(result).toMatchObject({ id: 'uuid', name: 'Test' });
  });

  // Test cập nhật công ty
  it('should update company', async () => {
    (prisma.jobPost.findFirst as jest.Mock).mockResolvedValue({
      company: { id: 'uuid' },
    });
    (prisma.company.update as jest.Mock).mockResolvedValue({});
    const result = await service.updateMyCompany('recruiter-id', {
      name: 'New',
    });
    expect(result).toBe(true);
  });

  // Test xóa công ty
  it('should delete company if no job posts', async () => {
    (prisma.jobPost.findFirst as jest.Mock).mockResolvedValue({
      company: { id: 'uuid' },
    });
    (prisma.jobPost.count as jest.Mock).mockResolvedValue(0);
    (prisma.company.delete as jest.Mock).mockResolvedValue({});
    const result = await service.deleteMyCompany('recruiter-id');
    expect(result).toBe(true);
  });

  // Test xóa công ty thất bại nếu còn job post
  it('should not delete company if has job posts', async () => {
    (prisma.jobPost.findFirst as jest.Mock).mockResolvedValue({
      company: { id: 'uuid' },
    });
    (prisma.jobPost.count as jest.Mock).mockResolvedValue(2);
    const result = await service.deleteMyCompany('recruiter-id');
    expect(result).toBe(false);
  });
});
