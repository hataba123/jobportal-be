// Service xử lý thông báo cho user (dùng lại logic từ admin)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  NotificationDto,
  CreateNotificationDto,
} from '../../admin/notification/notification.dto';
import { INotificationService } from '../../admin/notification/notification.iservice';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

@Injectable()

// Service xử lý thông báo cho user, implement đầy đủ các method của INotificationService
export class NotificationService implements INotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả thông báo (admin)
  async getAll(): Promise<NotificationDto[]> {
    // Hàm này chỉ dùng cho admin, user không dùng, trả về mảng rỗng hoặc throw nếu cần
    return [];
  }

  async getAllPaged(query: PageQueryDto): Promise<PagedResult<NotificationDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    return { items: [], total: 0, totalCount: 0, page, pageSize, totalPages: 0 };
  }

  // Lấy chi tiết thông báo theo id
  async getById(id: string): Promise<NotificationDto | null> {
    return this.getByIdAsync(id);
  }

  // Lấy thông báo theo userId
  async getByUserId(userId: string): Promise<NotificationDto[]> {
    return this.getByUserIdAsync(userId);
  }

  async getByUserIdPaged(userId: string, query: PageQueryDto): Promise<PagedResult<NotificationDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const [totalCount, notis] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = notis.map((n) => this.toDto(n));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  // Tạo mới thông báo (chỉ dùng cho admin)
  async create(dto: CreateNotificationDto): Promise<NotificationDto> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        message: dto.message,
        type: dto.type,
        read: false,
      },
    });
    return this.toDto(notification);
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
  async getByIdAsync(id: string, userId?: string): Promise<NotificationDto | null> {
    const n = await this.prisma.notification.findFirst({
      where: { id, ...(userId ? { userId } : {}) },
    });
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
  async markAsReadAsync(id: string, userId?: string): Promise<boolean> {
    const result = await this.prisma.notification.updateMany({
      where: { id, ...(userId ? { userId } : {}) },
      data: { read: true },
    });
    return result.count > 0;
  }

  // Xoá thông báo (user)
  async deleteAsync(id: string, userId?: string): Promise<boolean> {
    const result = await this.prisma.notification.deleteMany({
      where: { id, ...(userId ? { userId } : {}) },
    });
    return result.count > 0;
  }

  private toDto(n: {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: Date;
    type: string | null;
  }): NotificationDto {
    return {
      id: n.id,
      userId: n.userId,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      type: n.type || undefined,
    };
  }
}
