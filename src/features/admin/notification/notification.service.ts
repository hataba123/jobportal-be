// Service xử lý logic notification cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationDto, CreateNotificationDto } from './notification.dto';
import { INotificationService } from './notification.iservice';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả notification
  async getAll(): Promise<NotificationDto[]> {
    const noti = await this.prisma.notification.findMany();
    return noti.map((n) => this.toDto(n));
  }

  async getAllPaged(query: PageQueryDto): Promise<PagedResult<NotificationDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const keyword = query.keyword?.trim();
    const where: any = keyword
      ? { message: { contains: keyword, mode: 'insensitive' } }
      : {};
    const sortFields: Record<string, string> = { createdAt: 'createdAt', read: 'read', type: 'type' };
    const sortBy = sortFields[query.sortBy ?? ''] ?? 'createdAt';
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    const [totalCount, notifications] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: [{ [sortBy]: sortDir }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = notifications.map((n) => this.toDto(n));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
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

  async getByUserIdPaged(userId: string, query: PageQueryDto): Promise<PagedResult<NotificationDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const [totalCount, notifications] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = notifications.map((n) => this.toDto(n));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
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
