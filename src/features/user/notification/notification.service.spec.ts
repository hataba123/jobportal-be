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
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
                id: '1', userId: 'id', message: 'msg', read: false,
                createdAt: new Date(), type: null,
              }),
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
              deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
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
    prisma.notification.updateMany = jest.fn().mockResolvedValue({ count: 1 });
    expect(await service.markAsReadAsync('id')).toBe(true);
  });

  // Test deleteAsync
  it('should return true for deleteAsync', async () => {
    prisma.notification.deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    expect(await service.deleteAsync('id')).toBe(true);
  });

  it('should create a notification', async () => {
    await expect(
      service.create({ userId: 'id', message: 'msg' }),
    ).resolves.toMatchObject({
      userId: 'id',
      message: 'msg',
      read: false,
    });
  });
});
