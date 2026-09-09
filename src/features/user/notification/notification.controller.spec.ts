import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;
  const getByIdMock = jest.fn();
  const markAsReadMock = jest.fn();
  const deleteMock = jest.fn();

  beforeEach(async () => {
    getByIdMock.mockReset().mockResolvedValue(null);
    markAsReadMock.mockReset().mockResolvedValue(true);
    deleteMock.mockReset().mockResolvedValue(true);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            getByUserIdAsync: jest.fn().mockResolvedValue([]),
            getByIdAsync: getByIdMock,
            markAsReadAsync: markAsReadMock,
            deleteAsync: deleteMock,
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
    getByIdMock.mockResolvedValue({ id: '1' } as any);
    const req = { user: { userId: 'user-1' } };
    expect(await controller.getById(req, '1')).toEqual({ id: '1' });
    expect(getByIdMock).toHaveBeenCalledWith('1', 'user-1');
  });
  it('should throw NotFoundException if not found', async () => {
    getByIdMock.mockResolvedValue(null);
    await expect(
      controller.getById({ user: { userId: 'user-1' } }, '1'),
    ).rejects.toThrow(NotFoundException);
  });

  // Test markAsRead
  it('should return message when mark as read', async () => {
    markAsReadMock.mockResolvedValue(true);
    expect(await controller.markAsRead({ user: { userId: 'user-1' } }, '1')).toEqual({
      message: expect.any(String),
    });
    expect(markAsReadMock).toHaveBeenCalledWith('1', 'user-1');
  });
  it('should throw NotFoundException if mark as read fails', async () => {
    markAsReadMock.mockResolvedValue(false);
    await expect(
      controller.markAsRead({ user: { userId: 'user-1' } }, '1'),
    ).rejects.toThrow(NotFoundException);
  });

  // Test delete
  it('should return message when delete', async () => {
    deleteMock.mockResolvedValue(true);
    expect(await controller.delete({ user: { userId: 'user-1' } }, '1')).toEqual({
      message: expect.any(String),
    });
    expect(deleteMock).toHaveBeenCalledWith('1', 'user-1');
  });
  it('should throw NotFoundException if delete fails', async () => {
    deleteMock.mockResolvedValue(false);
    await expect(
      controller.delete({ user: { userId: 'user-1' } }, '1'),
    ).rejects.toThrow(NotFoundException);
  });
});
