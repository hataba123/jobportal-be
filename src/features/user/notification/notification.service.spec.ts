import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue(null),
              update: jest.fn().mockResolvedValue({}),
              delete: jest.fn().mockResolvedValue({}),
            },
          },
        },
      ],
    }).compile();
    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Test getAll
  it('should return empty array for getAll', async () => {
    expect(await service.getAll()).toEqual([]);
  });

  // Test getByUserIdAsync
  it('should return empty array for getByUserIdAsync', async () => {
    expect(await service.getByUserIdAsync('userId')).toEqual([]);
  });

  // Test getByIdAsync
  it('should return null for getByIdAsync', async () => {
    expect(await service.getByIdAsync('id')).toBeNull();
  });

  // Test markAsReadAsync
  it('should return true for markAsReadAsync', async () => {
    prisma.notification.update = jest.fn().mockResolvedValue({});
    expect(await service.markAsReadAsync('id')).toBe(true);
  });

  // Test deleteAsync
  it('should return true for deleteAsync', async () => {
    prisma.notification.delete = jest.fn().mockResolvedValue({});
    expect(await service.deleteAsync('id')).toBe(true);
  });

  // Test create throws error
  it('should throw error for create', async () => {
    await expect(
      service.create({ userId: 'id', message: 'msg' }),
    ).rejects.toThrow('Not implemented');
  });
});
