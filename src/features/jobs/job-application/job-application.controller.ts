import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
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
  @Roles('2') // Chỉ candidate
  @Post()
  async applyToJob(@Req() req, @Body() request: JobApplicationRequest) {
    console.log('[DEBUG][applyToJob] req.user:', req.user);
    const candidateId = req.user?.userId;
    await this.jobApplicationService.applyToJob(candidateId, request);
    return { message: 'Ứng tuyển thành công' };
  }

  // Nhà tuyển dụng xem danh sách ứng viên ứng tuyển vào job
  @Roles('1') // Chỉ recruiter
  @Get('job/:jobPostId/candidates')
  async getCandidatesForJob(@Req() req, @Param('jobPostId') jobPostId: string) {
    const recruiterId = req.user?.userId;
    return this.jobApplicationService.getCandidatesForJob(
      recruiterId,
      jobPostId,
    );
  }

  // Ứng viên xem các job đã ứng tuyển
  @Roles('2') // Chỉ candidate
  @Get('my-jobs')
  async getMyAppliedJobs(@Req() req) {
    const candidateId = req.user?.userId;
    return this.jobApplicationService.getMyAppliedJobs(candidateId);
  }

  // Admin: lấy tất cả record ứng tuyển
  @Roles('0') // Chỉ admin
  @Get()
  async getAll() {
    return this.jobApplicationService.getAll();
  }

  // Admin/Recruiter: cập nhật trạng thái ứng tuyển (PATCH)
  @Roles('0', '1') // Admin và Recruiter
  @Patch(':id/status')
  async updateStatusPatch(
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
  ) {
    await this.jobApplicationService.updateStatus(id, body.status);
    return { message: 'Cập nhật trạng thái thành công' };
  }

  // Admin/Recruiter: cập nhật trạng thái ứng tuyển (PUT)
  @Roles('0', '1') // Admin và Recruiter
  @Put(':id/status')
  async updateStatusPut(
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
  ) {
    await this.jobApplicationService.updateStatus(id, body.status);
    return { message: 'Cập nhật trạng thái thành công' };
  }

  // Admin: xóa record ứng tuyển, bắt log lỗi
  @Roles('0') // Chỉ admin
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const deleted = await this.jobApplicationService.delete(id);
      if (!deleted) {
        return { message: 'Không tìm thấy record để xóa', notFound: true };
      }
      return { message: 'Xóa thành công' };
    } catch (error) {
      // Ghi log lỗi chi tiết khi xóa job application
      console.error('Lỗi xóa job application:', { id, error });
      throw error;
    }
  }

  // Admin/Candidate: lấy chi tiết 1 record ứng tuyển
  @Roles('0', '2') // Admin và Candidate
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.jobApplicationService.getById(id);
  }
}
