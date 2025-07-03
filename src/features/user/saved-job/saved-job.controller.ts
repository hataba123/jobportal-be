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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('SavedJobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/saved-jobs')
export class SavedJobController {
  constructor(private readonly savedJobService: SavedJobService) {}

  // Lấy danh sách job đã lưu
  @Get()
  async getSavedJobs(@Req() req) {
    const userId = req.user.userId;
    return this.savedJobService.getSavedJobsAsync(userId);
  }

  // Lưu job
  @Post(':jobPostId')
  async saveJob(@Req() req, @Param('jobPostId') jobPostId: string) {
    const userId = req.user.userId;
    await this.savedJobService.saveJobAsync(userId, jobPostId);
    return { message: 'Lưu công việc thành công.' };
  }

  // Bỏ lưu job
  @Delete(':jobPostId')
  async unsaveJob(@Req() req, @Param('jobPostId') jobPostId: string) {
    const userId = req.user.userId;
    const result = await this.savedJobService.unsaveJobAsync(userId, jobPostId);
    if (!result) throw new NotFoundException();
    return { message: 'Đã xoá khỏi danh sách đã lưu.' };
  }
}
