import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            getByUserIdAsync: jest.fn().mockResolvedValue([]),
            getByIdAsync: jest.fn().mockResolvedValue(null),
            markAsReadAsync: jest.fn().mockResolvedValue(true),
            deleteAsync: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();
    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  // Test getMyNotifications
  it('should return notifications for user', async () => {
    jest
      .spyOn(service, 'getByUserIdAsync')
      .mockResolvedValue([{ id: '1' } as any]);
    const req = { user: { userId: '1' } };
    expect(await controller.getMyNotifications(req)).toEqual([{ id: '1' }]);
  });

  // Test getById
  it('should return notification by id', async () => {
    jest.spyOn(service, 'getByIdAsync').mockResolvedValue({ id: '1' } as any);
    expect(await controller.getById('1')).toEqual({ id: '1' });
  });
  it('should throw NotFoundException if not found', async () => {
    jest.spyOn(service, 'getByIdAsync').mockResolvedValue(null);
    await expect(controller.getById('1')).rejects.toThrow(NotFoundException);
  });

  // Test markAsRead
  it('should return message when mark as read', async () => {
    jest.spyOn(service, 'markAsReadAsync').mockResolvedValue(true);
    expect(await controller.markAsRead('1')).toEqual({
      message: expect.any(String),
    });
  });
  it('should throw NotFoundException if mark as read fails', async () => {
    jest.spyOn(service, 'markAsReadAsync').mockResolvedValue(false);
    await expect(controller.markAsRead('1')).rejects.toThrow(NotFoundException);
  });

  // Test delete
  it('should return message when delete', async () => {
    jest.spyOn(service, 'deleteAsync').mockResolvedValue(true);
    expect(await controller.delete('1')).toEqual({
      message: expect.any(String),
    });
  });
  it('should throw NotFoundException if delete fails', async () => {
    jest.spyOn(service, 'deleteAsync').mockResolvedValue(false);
    await expect(controller.delete('1')).rejects.toThrow(NotFoundException);
  });
});
