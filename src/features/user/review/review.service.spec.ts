import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: PrismaService,
          useValue: {
            review: {
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({}),
              aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 } }),
            },
            company: {
              update: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();
    service = module.get<ReviewService>(ReviewService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return all reviews', async () => {
    prisma.review.findMany = jest
      .fn()
      .mockResolvedValue([
        {
          id: '1',
          userId: '2',
          companyId: '3',
          rating: 5,
          comment: 'A',
          createdAt: new Date(),
        },
      ]);
    const result = await service.getAllAsync();
    expect(result[0].id).toBe('1');
  });

  it('should return reviews by company', async () => {
    prisma.review.findMany = jest
      .fn()
      .mockResolvedValue([
        {
          id: '1',
          userId: '2',
          companyId: '3',
          rating: 5,
          comment: 'A',
          createdAt: new Date(),
        },
      ]);
    const result = await service.getByCompanyAsync('3');
    expect(result[0].companyId).toBe('3');
  });

  it('should create review and update company rating', async () => {
    prisma.review.create = jest.fn().mockResolvedValue({});
    prisma.review.aggregate = jest
      .fn()
      .mockResolvedValue({ _avg: { rating: 5 } });
    prisma.company.update = jest.fn().mockResolvedValue({});
    await expect(
      service.createAsync('2', { companyId: '3', rating: 5, comment: 'A' }),
    ).resolves.toBeUndefined();
  });
});
