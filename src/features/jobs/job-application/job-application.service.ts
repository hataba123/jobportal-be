import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FileUtil } from '../../../common/utils/file.util';
import { IJobApplicationService } from './job-application.iservice';
import {
  JobApplicationRequest,
  UpdateApplyStatusRequest,
  ApplyDto,
  CandidateApplicationDto,
  JobAppliedDto,
} from './job-application.dto';
import { ApplyStatus } from '@prisma/client';

// Service xử lý logic ứng tuyển việc làm
@Injectable()
export class JobApplicationService implements IJobApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  // Ứng viên ứng tuyển vào job
  async applyToJob(
    candidateId: string,
    request: JobApplicationRequest,
  ): Promise<void> {
    // Kiểm tra candidateId hợp lệ
    if (!candidateId) {
      // Nếu không xác thực được user, trả về lỗi rõ ràng
      throw new BadRequestException('Không xác thực được user ứng tuyển.');
    }

    // Tìm job post theo id
    const jobPost = await this.prisma.jobPost.findUnique({
      where: { id: request.jobPostId },
    });
    if (!jobPost) throw new NotFoundException('Công việc không tồn tại.');

    // Tìm candidate profile theo userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
    });
    if (!candidateProfile)
      throw new NotFoundException('Hồ sơ ứng viên chưa tồn tại.');

    // Sử dụng FileUtil để validate CV nếu có
    let cvUrl = request.cvUrl ?? candidateProfile.resumeUrl ?? undefined;
    if (!cvUrl)
      throw new BadRequestException('Bạn cần tải lên CV trước khi ứng tuyển.');

    // Kiểm tra file CV có hợp lệ không (nếu có đường dẫn file local)
    if (cvUrl && cvUrl.startsWith('/uploads/')) {
      const filePath = require('path').join(
        process.cwd(),
        'wwwroot',
        cvUrl.replace(/^\//, ''),
      );
      if (!require('fs').existsSync(filePath)) {
        throw new BadRequestException(
          'File CV không tồn tại, vui lòng tải lên lại.',
        );
      }
    }

    // Kiểm tra duplicate application
    const existingApplication = await this.prisma.job.findFirst({
      where: { candidateId, jobPostId: request.jobPostId },
    });
    if (existingApplication) {
      throw new BadRequestException('Bạn đã ứng tuyển vào công việc này rồi.');
    }

    await this.prisma.job.create({
      data: {
        jobPostId: request.jobPostId,
        candidateId,
        cvUrl: cvUrl,
        appliedAt: new Date(),
        status: ApplyStatus.Pending,
      },
    });
  }

  // Nhà tuyển dụng xem danh sách ứng viên ứng tuyển vào job
  async getCandidatesForJob(
    recruiterId: string,
    jobPostId: string,
  ): Promise<CandidateApplicationDto[]> {
    // Log để debug
    console.log('[DEBUG] getCandidatesForJob:', { recruiterId, jobPostId });

    // Kiểm tra job có tồn tại không trước
    const jobExists = await this.prisma.jobPost.findUnique({
      where: { id: jobPostId },
    });
    console.log('[DEBUG] Job exists:', jobExists ? 'YES' : 'NO');

    if (!jobExists) {
      // Trả về mảng rỗng thay vì throw error để FE dễ xử lý
      console.log('[DEBUG] Job not found, returning empty array');
      return [];
    }

    if (jobExists.employerId !== recruiterId) {
      throw new NotFoundException(
        'Bạn không có quyền xem ứng viên của công việc này.',
      );
    }

    // Lấy danh sách ứng viên ứng tuyển
    const applications = await this.prisma.job.findMany({
      where: { jobPostId },
      include: { candidate: true },
    });

    console.log('[DEBUG] Found applications:', applications.length);

    return applications.map((a) => ({
      id: a.id,
      candidateId: a.candidateId,
      fullName: a.candidate.fullName,
      email: a.candidate.email,
      appliedAt: a.appliedAt,
      cvUrl: a.cvUrl ?? undefined,
      status: a.status as string,
    }));
  }

  // Ứng viên xem các job đã ứng tuyển
  async getMyAppliedJobs(candidateId: string): Promise<JobAppliedDto[]> {
    const jobs = await this.prisma.job.findMany({
      where: { candidateId },
      include: { jobPost: true },
    });
    return jobs.map((a) => ({
      id: a.id,
      jobPostId: a.jobPostId,
      title: a.jobPost.title,
      description: a.jobPost.description,
      skillsRequired: a.jobPost.skillsRequired ?? '',
      location: a.jobPost.location ?? '',
      salary: Number(a.jobPost.salary),
      appliedAt: a.appliedAt,
      status: a.status as string,
    }));
  }

  // Admin: lấy tất cả record ứng tuyển
  async getAll(): Promise<ApplyDto[]> {
    const jobs = await this.prisma.job.findMany({
      include: { jobPost: true, candidate: true },
    });
    return jobs.map((j) => ({
      id: j.id,
      candidateId: j.candidateId,
      candidateName: j.candidate.fullName,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      cvUrl: j.cvUrl ?? '',
      status: j.status as string,
      appliedAt: j.appliedAt,
    }));
  }

  // Admin/Candidate: lấy chi tiết 1 record ứng tuyển
  async getById(id: string): Promise<ApplyDto | null> {
    const j = await this.prisma.job.findUnique({
      where: { id },
      include: { jobPost: true, candidate: true },
    });
    if (!j) return null;
    return {
      id: j.id,
      candidateId: j.candidateId,
      candidateName: j.candidate.fullName,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      cvUrl: j.cvUrl ?? '',
      status: j.status as string,
      appliedAt: j.appliedAt,
    };
  }

  // Admin/Recruiter: cập nhật trạng thái ứng tuyển
  async updateStatus(id: string, status: string): Promise<boolean> {
    const updated = await this.prisma.job.update({
      where: { id },
      data: { status: status as any },
    });
    return !!updated;
  }

  // Admin: xóa record ứng tuyển, trả về false nếu không tìm thấy
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.job.delete({ where: { id } });
      return true;
    } catch (error) {
      // Nếu lỗi là không tìm thấy record (P2025), trả về false, không throw
      if (error?.code === 'P2025') {
        return false;
      }
      // Các lỗi khác vẫn throw để controller log
      throw error;
    }
  }
}
