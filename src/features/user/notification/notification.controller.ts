// Controller quản lý thông báo cho user
import {
  Controller,
  Get,
  Param,
  Put,
  Delete,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Lấy danh sách thông báo của user hiện tại
  @Get()
  async getMyNotifications(@Req() req) {
    const userId = req.user.userId;
    return this.notificationService.getByUserIdAsync(userId);
  }

  // Xem chi tiết thông báo
  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.notificationService.getByIdAsync(id);
    if (!result) throw new NotFoundException();
    return result;
  }

  // Đánh dấu là đã đọc
  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    const success = await this.notificationService.markAsReadAsync(id);
    if (!success) throw new NotFoundException();
    return { message: 'Thông báo đã được đánh dấu là đã đọc.' };
  }

  // Xoá thông báo
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.notificationService.deleteAsync(id);
    if (!success) throw new NotFoundException();
    return { message: 'Xoá thông báo thành công.' };
  }
}
