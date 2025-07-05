// Service xử lý thông báo cho user (dùng lại logic từ admin)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  NotificationDto,
  CreateNotificationDto,
} from '../../admin/notification/notification.dto';
import { INotificationService } from '../../admin/notification/notification.iservice';

@Injectable()

// Service xử lý thông báo cho user, implement đầy đủ các method của INotificationService
export class NotificationService implements INotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả thông báo (admin)
  async getAll(): Promise<NotificationDto[]> {
    // Hàm này chỉ dùng cho admin, user không dùng, trả về mảng rỗng hoặc throw nếu cần
    return [];
  }

  // Lấy chi tiết thông báo theo id
  async getById(id: string): Promise<NotificationDto | null> {
    return this.getByIdAsync(id);
  }

  // Lấy thông báo theo userId
  async getByUserId(userId: string): Promise<NotificationDto[]> {
    return this.getByUserIdAsync(userId);
  }

  // Tạo mới thông báo (chỉ dùng cho admin)
  async create(dto: CreateNotificationDto): Promise<NotificationDto> {
    // Hàm này chỉ dùng cho admin, user không dùng, throw lỗi
    throw new Error('Not implemented');
  }

  // Đánh dấu đã đọc
  async markAsRead(id: string): Promise<boolean> {
    return this.markAsReadAsync(id);
  }

  // Xoá thông báo
  async delete(id: string): Promise<boolean> {
    return this.deleteAsync(id);
  }

  // Lấy thông báo theo userId (user)
  async getByUserIdAsync(userId: string): Promise<NotificationDto[]> {
    const notis = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notis.map((n) => ({
      id: n.id,
      userId: n.userId,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      type: n.type || undefined,
    }));
  }

  // Lấy chi tiết thông báo (user)
  async getByIdAsync(id: string): Promise<NotificationDto | null> {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    if (!n) return null;
    return {
      id: n.id,
      userId: n.userId,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      type: n.type || undefined,
    };
  }

  // Đánh dấu đã đọc (user)
  async markAsReadAsync(id: string): Promise<boolean> {
    const n = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return !!n;
  }

  // Xoá thông báo (user)
  async deleteAsync(id: string): Promise<boolean> {
    await this.prisma.notification.delete({ where: { id } });
    return true;
  }
}
