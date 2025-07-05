// Controller quản lý saved job cho user
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SavedJobService } from './saved-job.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('SavedJobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/saved-jobs')
export class SavedJobController {
  constructor(private readonly savedJobService: SavedJobService) {}

  // Lấy danh sách job đã lưu của user hiện tại
  // Trả về mảng các job đã lưu, yêu cầu user phải đăng nhập
  @Get()
  async getSavedJobs(@Req() req) {
    // Lấy userId từ JWT payload đã validate
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException(
        'JWT payload không có userId, vui lòng đăng nhập lại!',
      );
    }
    return this.savedJobService.getSavedJobsAsync(userId);
  }

  // Lưu một job vào danh sách đã lưu của user
  // Chỉ user đã đăng nhập mới được phép lưu job
  @Post(':jobPostId')
  async saveJob(@Req() req, @Param('jobPostId') jobPostId: string) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException(
        'JWT payload không có userId, vui lòng đăng nhập lại!',
      );
    }
    await this.savedJobService.saveJobAsync(userId, jobPostId);
    return { message: 'Lưu công việc thành công.' };
  }

  // Xoá một job khỏi danh sách đã lưu của user
  // Chỉ user đã đăng nhập mới được phép xoá job đã lưu
  @Delete(':jobPostId')
  async unsaveJob(@Req() req, @Param('jobPostId') jobPostId: string) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException(
        'JWT payload không có userId, vui lòng đăng nhập lại!',
      );
    }
    const result = await this.savedJobService.unsaveJobAsync(userId, jobPostId);
    if (!result) throw new NotFoundException();
    return { message: 'Đã xoá khỏi danh sách đã lưu.' };
  }
}
