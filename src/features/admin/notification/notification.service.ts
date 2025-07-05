// Service xử lý logic notification cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationDto, CreateNotificationDto } from './notification.dto';
import { INotificationService } from './notification.iservice';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả notification
  async getAll(): Promise<NotificationDto[]> {
    const noti = await this.prisma.notification.findMany();
    return noti.map((n) => this.toDto(n));
  }

  // Lấy notification theo id
  async getById(id: string): Promise<NotificationDto | null> {
    const n = await this.prisma.notification.findUnique({ where: { id } });
    return n ? this.toDto(n) : null;
  }

  // Lấy notification theo userId
  async getByUserId(userId: string): Promise<NotificationDto[]> {
    const noti = await this.prisma.notification.findMany({ where: { userId } });
    return noti.map((n) => this.toDto(n));
  }

  // Tạo mới notification
  async create(dto: CreateNotificationDto): Promise<NotificationDto> {
    const n = await this.prisma.notification.create({
      data: { ...dto, read: false, createdAt: new Date() },
    });
    return this.toDto(n);
  }

  // Đánh dấu đã đọc
  async markAsRead(id: string): Promise<boolean> {
    const n = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return !!n;
  }

  // Xóa notification
  async delete(id: string): Promise<boolean> {
    const n = await this.prisma.notification.delete({ where: { id } });
    return !!n;
  }

  // Chuyển entity sang DTO
  private toDto(entity: any): NotificationDto {
    return {
      id: entity.id,
      userId: entity.userId,
      message: entity.message,
      createdAt: entity.createdAt,
      read: entity.read,
      type: entity.type ?? undefined,
    };
  }
}
