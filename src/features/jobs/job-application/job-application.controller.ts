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
  Headers,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  CandidateOnly,
  RecruiterOnly,
  AdminOnly,
  Roles,
} from '../../../common/decorators/roles.decorator';
import { JobApplicationService } from './job-application.service';
import {
  JobApplicationRequest,
  UpdateApplyStatusRequest,
} from './job-application.dto';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { PageQueryDto } from '../../../common/dto/pagination.dto';

// Controller quản lý ứng tuyển việc làm
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/jobapplication')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  // Ứng viên ứng tuyển vào job
  @CandidateOnly()
  @Post()
  async applyToJob(@Req() req, @Body() request: JobApplicationRequest) {
    console.log('[DEBUG][applyToJob] req.user:', req.user);
    const candidateId = req.user?.userId;
    await this.jobApplicationService.applyToJob(candidateId, request);
    return { message: 'Ứng tuyển thành công' };
  }

  // Nhà tuyển dụng xem danh sách ứng viên ứng tuyển vào job
  @RecruiterOnly()
  @Get('job/:jobPostId/candidates')
  async getCandidatesForJob(
    @Req() req,
    @Param('jobPostId') jobPostId: string,
    @Query() query?: PageQueryDto,
  ) {
    const recruiterId = req.user?.userId;
    if (query) {
      return this.jobApplicationService.getCandidatesForJobPaged(
        recruiterId,
        jobPostId,
        query,
      );
    }
    return this.jobApplicationService.getCandidatesForJob(
      recruiterId,
      jobPostId,
    );
  }

  // Ứng viên xem các job đã ứng tuyển
  @CandidateOnly()
  @Get('my-jobs')
  async getMyAppliedJobs(@Req() req, @Query() query?: PageQueryDto) {
    const candidateId = req.user?.userId;
    if (query) return this.jobApplicationService.getMyAppliedJobsPaged(candidateId, query);
    return this.jobApplicationService.getMyAppliedJobs(candidateId);
  }

  // Admin: lấy tất cả record ứng tuyển
  @AdminOnly()
  @Get()
  async getAll(@Query() query?: PageQueryDto) {
    if (query) return this.jobApplicationService.getAllPaged(query);
    return this.jobApplicationService.getAll();
  }

  // Recruiter: chuyển trạng thái theo workflow
  @RecruiterOnly()
  @Patch(':id/status')
  async updateStatusPatch(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
    @Headers('if-match') ifMatch?: string,
  ) {
    const version = decodeVersion(ifMatch);
    await this.jobApplicationService.updateStatus(
      id,
      body.requestedStatus,
      req.user.userId,
      false,
      version,
      body.reason,
    );
    const current = await this.jobApplicationService.getById(id);
    return { message: 'Cập nhật trạng thái thành công', version: current?.version };
  }

  // Recruiter: chuyển trạng thái theo workflow
  @RecruiterOnly()
  @Put(':id/status')
  async updateStatusPut(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
    @Headers('if-match') ifMatch?: string,
  ) {
    const version = decodeVersion(ifMatch);
    await this.jobApplicationService.updateStatus(
      id,
      body.requestedStatus,
      req.user.userId,
      false,
      version,
      body.reason,
    );
    const current = await this.jobApplicationService.getById(id);
    return { message: 'Cập nhật trạng thái thành công', version: current?.version };
  }

  @CandidateOnly()
  @Post(':id/withdraw')
  async withdraw(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
    @Headers('if-match') ifMatch?: string,
  ) {
    const result = await this.jobApplicationService.withdraw(
      id,
      req.user.userId,
      decodeVersion(ifMatch),
      body.reason,
    );
    if (!result) throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển.');
    return result;
  }

  @Roles('0', '1', '2')
  @Get(':id/history')
  async history(@Req() req, @Param('id') id: string) {
    const result = await this.jobApplicationService.getHistory(id, req.user.userId, req.user.role);
    if (!result) throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển.');
    return result;
  }

  // Admin: xóa record ứng tuyển
  @AdminOnly()
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
  @Roles('0', '1', '2')
  @Get(':id')
  async getById(@Req() req, @Param('id') id: string) {
    return this.jobApplicationService.getByIdForUser(
      id,
      req.user.userId,
      req.user.role,
    );
  }
}
