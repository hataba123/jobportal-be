// Controller quản lý notification cho admin
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './notification.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0')
@Controller('api/admin/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Lấy tất cả notification
  @Get()
  async getAll() {
    return await this.notificationService.getAll();
  }

  // Lấy notification theo id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const n = await this.notificationService.getById(id);
    if (!n) throw new NotFoundException('Notification not found');
    return n;
  }

  // Tạo mới notification
  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return await this.notificationService.create(dto);
  }

  // Đánh dấu đã đọc
  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string) {
    const success = await this.notificationService.markAsRead(id);
    if (!success) throw new NotFoundException('Notification not found');
    return { message: 'Đã đánh dấu là đã đọc.' };
  }

  // Xóa notification
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const success = await this.notificationService.delete(id);
    if (!success) throw new NotFoundException('Notification not found');
    return { message: 'Xoá thông báo thành công.' };
  }
}
