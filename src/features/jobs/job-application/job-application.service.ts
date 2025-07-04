import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
  // Kiểm tra đầu vào, đảm bảo candidateId không undefined, tránh lỗi Prisma
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

    // Lấy url CV từ request hoặc profile
    let cvUrl = request.cvUrl ?? candidateProfile.resumeUrl ?? undefined;
    if (!cvUrl)
      throw new BadRequestException('Bạn cần tải lên CV trước khi ứng tuyển.');

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
    const jobPost = await this.prisma.jobPost.findFirst({
      where: { id: jobPostId, employerId: recruiterId },
    });
    if (!jobPost)
      throw new NotFoundException(
        'Không tìm thấy công việc hoặc bạn không có quyền.',
      );

    const applications = await this.prisma.job.findMany({
      where: { jobPostId },
      include: { candidate: true },
    });
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

  // Admin: xóa record ứng tuyển
  async delete(id: string): Promise<boolean> {
    await this.prisma.job.delete({ where: { id } });
    return true;
  }
}
