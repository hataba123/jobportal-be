import { Test, TestingModule } from '@nestjs/testing';
import { SavedJobService } from './saved-job.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('SavedJobService', () => {
  let service: SavedJobService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedJobService,
        {
          provide: PrismaService,
          useValue: {
            savedJob: {
              findMany: jest.fn().mockResolvedValue([]),
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();
    service = module.get<SavedJobService>(SavedJobService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return saved jobs', async () => {
    prisma.savedJob.findMany = jest
      .fn()
      .mockResolvedValue([
        {
          id: '1',
          jobPostId: '2',
          jobPost: { title: 'T', location: 'L' },
          savedAt: new Date(),
        },
      ]);
    const result = await service.getSavedJobsAsync('1');
    expect(result[0].id).toBe('1');
  });

  it('should save job', async () => {
    prisma.savedJob.findFirst = jest.fn().mockResolvedValue(null);
    prisma.savedJob.create = jest.fn().mockResolvedValue({});
    await expect(service.saveJobAsync('1', '2')).resolves.toBeUndefined();
  });

  it('should throw error if job already saved', async () => {
    prisma.savedJob.findFirst = jest.fn().mockResolvedValue({});
    await expect(service.saveJobAsync('1', '2')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should unsave job', async () => {
    prisma.savedJob.findFirst = jest.fn().mockResolvedValue({ id: '1' });
    prisma.savedJob.delete = jest.fn().mockResolvedValue({});
    await expect(service.unsaveJobAsync('1', '2')).resolves.toBe(true);
  });

  it('should return false if job not found when unsave', async () => {
    prisma.savedJob.findFirst = jest.fn().mockResolvedValue(null);
    await expect(service.unsaveJobAsync('1', '2')).resolves.toBe(false);
  });
});
