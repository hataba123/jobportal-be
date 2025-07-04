import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JobApplicationService } from './job-application.service';
import {
  JobApplicationRequest,
  UpdateApplyStatusRequest,
} from './job-application.dto';

// Controller quản lý ứng tuyển việc làm
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/jobapplication')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  // Ứng viên ứng tuyển vào job
  // Bắt buộc xác thực JWT, log user để debug lỗi xác thực
  @Post()
  async applyToJob(@Req() req, @Body() request: JobApplicationRequest) {
    console.log('[DEBUG][applyToJob] req.user:', req.user);
    const candidateId = req.user?.userId;
    await this.jobApplicationService.applyToJob(candidateId, request);
    return { message: 'Ứng tuyển thành công' };
  }

  // Nhà tuyển dụng xem danh sách ứng viên ứng tuyển vào job
  @Get('job/:jobPostId/candidates')
  async getCandidatesForJob(@Req() req, @Param('jobPostId') jobPostId: string) {
    const recruiterId = req.user?.userId;
    return this.jobApplicationService.getCandidatesForJob(
      recruiterId,
      jobPostId,
    );
  }

  // Ứng viên xem các job đã ứng tuyển
  @Get('my-jobs')
  async getMyAppliedJobs(@Req() req) {
    const candidateId = req.user?.userId;
    return this.jobApplicationService.getMyAppliedJobs(candidateId);
  }

  // Admin: lấy tất cả record ứng tuyển
  @Get()
  async getAll() {
    return this.jobApplicationService.getAll();
  }

  // Admin/Candidate: lấy chi tiết 1 record ứng tuyển
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.jobApplicationService.getById(id);
  }

  // Admin/Recruiter: cập nhật trạng thái ứng tuyển
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
  ) {
    await this.jobApplicationService.updateStatus(id, body.status);
    return { message: 'Cập nhật trạng thái thành công' };
  }

  // Admin: xóa record ứng tuyển
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.jobApplicationService.delete(id);
    return { message: 'Xóa thành công' };
  }
}
