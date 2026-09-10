import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Optional,
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
import { ApplyStatus, Prisma } from '@prisma/client';
import { NotificationService } from '../../user/notification/notification.service';
import { EmailNotificationService } from '../../../common/email/email-notification.service';
import { ApplicationWorkflowService } from './application-workflow.service';
import { OutboxService } from '../../../common/outbox/outbox.service';
import { AuditLogService } from '../../../common/audit/audit-log.service';
import { concurrencyConflict, encodeVersion } from '../../../common/concurrency/concurrency';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

// Service xử lý logic ứng tuyển việc làm
@Injectable()
export class JobApplicationService implements IJobApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationService,
    @Optional() private readonly emailNotifications?: EmailNotificationService,
    @Optional() private readonly workflow?: ApplicationWorkflowService,
    @Optional() private readonly outbox?: OutboxService,
    @Optional() private readonly audit?: AuditLogService,
  ) {}

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
    const jobPost = await this.prisma.jobPost.findFirst({
      where: { id: request.jobPostId, deletedAt: null },
      include: { employer: { select: { email: true } } },
    });
    if (
      !jobPost ||
      jobPost.status !== 'Active' ||
      (jobPost.expiresAt && jobPost.expiresAt <= new Date())
    ) {
      throw new NotFoundException('Công việc không tồn tại hoặc đã hết hạn.');
    }

    // Tìm candidate profile theo userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
    });
    if (!candidateProfile)
      throw new NotFoundException('Hồ sơ ứng viên chưa tồn tại.');

    // CV chỉ lấy từ hồ sơ đã upload; không tin đường dẫn client gửi lên.
    const cvUrl = candidateProfile.resumeUrl ?? undefined;
    if (!cvUrl)
      throw new BadRequestException('Bạn cần tải lên CV trước khi ứng tuyển.');

    const filePath = FileUtil.resolvePrivateCvPath(cvUrl);
    if (!filePath || !require('fs').existsSync(filePath)) {
      throw new BadRequestException('File CV không tồn tại, vui lòng tải lên lại.');
    }

    // Kiểm tra duplicate application
    const existingApplication = await this.prisma.job.findFirst({
      where: { candidateId, jobPostId: request.jobPostId },
    });
    if (existingApplication) {
      throw new BadRequestException('Bạn đã ứng tuyển vào công việc này rồi.');
    }

    const candidate = await this.prisma.user.findUnique({
      where: { id: candidateId },
      select: { email: true },
    });
    try {
      await this.prisma.$transaction(async (tx) => {
        const application = await tx.job.create({
          data: {
            jobPostId: request.jobPostId,
            candidateId,
            cvUrl,
            appliedAt: new Date(),
            status: ApplyStatus.Applied,
          },
        });
        await tx.applicationStatusHistory.create({
          data: {
            applicationId: application.id,
            fromStatus: null,
            toStatus: ApplyStatus.Applied,
            changedBy: candidateId,
            reason: 'Application created',
          },
        });
        await this.audit?.add(tx, {
          actorId: candidateId,
          action: 'Application.Created',
          entityType: 'Application',
          entityId: application.id,
          after: { jobPostId: application.jobPostId, candidateId, status: application.status },
        });
        await this.outbox?.add(tx, 'application.created.notification', {
          applicationId: application.id,
          employerId: jobPost.employerId,
          candidateId,
          candidateEmail: candidate?.email,
          jobTitle: jobPost.title,
        } as Prisma.InputJsonValue, `application:${application.id}:created`);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Bạn đã ứng tuyển vào công việc này rồi.');
      }
      throw error;
    }
  }

  // Nhà tuyển dụng xem danh sách ứng viên ứng tuyển vào job
  async getCandidatesForJob(
    recruiterId: string,
    jobPostId: string,
  ): Promise<CandidateApplicationDto[]> {
    // Log để debug
    console.log('[DEBUG] getCandidatesForJob:', { recruiterId, jobPostId });

    // Kiểm tra job có tồn tại không trước
    const jobExists = await this.prisma.jobPost.findFirst({
      where: { id: jobPostId, deletedAt: null },
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
      cvUrl: a.cvUrl
        ? `/api/candidate-profile/recruiter/${a.candidateId}/cv`
        : undefined,
      status: a.status as string,
      version: encodeVersion(a.version),
    }));
  }

  async getCandidatesForJobPaged(
    recruiterId: string,
    jobPostId: string,
    query: PageQueryDto,
  ): Promise<PagedResult<CandidateApplicationDto>> {
    const jobExists = await this.prisma.jobPost.findFirst({
      where: { id: jobPostId, deletedAt: null },
      select: { employerId: true },
    });
    if (!jobExists) {
      return { items: [], total: 0, totalCount: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
    if (jobExists.employerId !== recruiterId) {
      throw new NotFoundException('Bạn không có quyền xem ứng viên của công việc này.');
    }
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const keyword = query.keyword?.trim();
    const where: any = {
      jobPostId,
      ...(keyword
        ? {
            candidate: {
              OR: [
                { fullName: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };
    const [totalCount, applications] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: { candidate: true },
        orderBy: [{ appliedAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = applications.map((a) => ({
      id: a.id,
      candidateId: a.candidateId,
      fullName: a.candidate.fullName,
      email: a.candidate.email,
      appliedAt: a.appliedAt,
      cvUrl: a.cvUrl ? `/api/candidate-profile/recruiter/${a.candidateId}/cv` : undefined,
      status: a.status as string,
      version: encodeVersion(a.version),
    }));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
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
      version: encodeVersion(a.version),
    }));
  }

  async getMyAppliedJobsPaged(candidateId: string, query: PageQueryDto): Promise<PagedResult<JobAppliedDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const [totalCount, jobs] = await this.prisma.$transaction([
      this.prisma.job.count({ where: { candidateId } }),
      this.prisma.job.findMany({
        where: { candidateId },
        include: { jobPost: true },
        orderBy: [{ appliedAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = jobs.map((a) => ({
      id: a.id,
      jobPostId: a.jobPostId,
      title: a.jobPost.title,
      description: a.jobPost.description,
      skillsRequired: a.jobPost.skillsRequired ?? '',
      location: a.jobPost.location ?? '',
      salary: Number(a.jobPost.salary),
      appliedAt: a.appliedAt,
      status: a.status as string,
      version: encodeVersion(a.version),
    }));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
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
      cvUrl: j.cvUrl
        ? `/api/candidate-profile/recruiter/${j.candidateId}/cv`
        : '',
      status: j.status as string,
      appliedAt: j.appliedAt,
    }));
  }

  async getAllPaged(query: PageQueryDto): Promise<PagedResult<ApplyDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const keyword = query.keyword?.trim();
    const where: any = keyword
      ? {
          OR: [
            { candidate: { fullName: { contains: keyword, mode: 'insensitive' } } },
            { jobPost: { title: { contains: keyword, mode: 'insensitive' } } },
          ],
        }
      : {};
    const [totalCount, jobs] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: { jobPost: true, candidate: true },
        orderBy: [{ appliedAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = jobs.map((j) => ({
      id: j.id,
      candidateId: j.candidateId,
      candidateName: j.candidate.fullName,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      cvUrl: j.cvUrl ? `/api/candidate-profile/recruiter/${j.candidateId}/cv` : '',
      status: j.status as string,
      appliedAt: j.appliedAt,
      version: encodeVersion(j.version),
    }));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  // Admin/Candidate: lấy chi tiết 1 record ứng tuyển
  async getById(id: string): Promise<ApplyDto | null> {
    const j = await this.prisma.job.findUnique({
      where: { id },
      include: { jobPost: true, candidate: true },
    });
    if (!j) return null;
    return this.toApplyDto(j);
  }

  // Admin/Recruiter: cập nhật trạng thái ứng tuyển
  async updateStatus(
    id: string,
    status: string,
    recruiterId?: string,
    isAdmin = false,
    expectedVersion?: number,
    reason?: string,
  ): Promise<boolean> {
    const application = await this.prisma.job.findUnique({
      where: { id },
      include: { jobPost: true, candidate: { select: { email: true } } },
    });
    if (!application) return false;
    if (
      !isAdmin &&
      (!recruiterId || application.jobPost.employerId !== recruiterId)
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đơn này.');
    }
    const nextStatus = (this.workflow ?? new ApplicationWorkflowService()).parse(status);
    if (!isAdmin) {
      (this.workflow ?? new ApplicationWorkflowService()).assertRecruiterTransition(
        application.status,
        nextStatus,
        reason,
      );
    } else if (!reason?.trim()) {
      throw new BadRequestException('Admin override bắt buộc phải có lý do.');
    }
    if (application.status === nextStatus) return true;
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.job.updateMany({
        where: { id, ...(expectedVersion === undefined ? {} : { version: expectedVersion }) },
        data: { status: nextStatus, version: { increment: 1 } },
      });
      if (updated.count !== 1) {
        const current = await tx.job.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: application.status,
          toStatus: nextStatus,
          changedBy: recruiterId,
          reason: reason?.trim() || null,
        },
      });
      await this.audit?.add(tx, {
        actorId: recruiterId,
        action: isAdmin ? 'Application.StatusOverride' : 'Application.StatusChanged',
        entityType: 'Application', entityId: id,
        before: { status: application.status },
        after: { status: nextStatus, reason: reason?.trim() || null },
      });
      await this.outbox?.add(tx, 'application.status.changed', {
        applicationId: id,
        candidateId: application.candidateId,
        candidateEmail: application.candidate?.email,
        jobTitle: application.jobPost.title,
        fromStatus: application.status,
        toStatus: nextStatus,
      } as Prisma.InputJsonValue, `application:${id}:status:${nextStatus}`);
    });
    return true;
  }

  async getByIdForUser(
    id: string,
    userId: string,
    role: string | number,
  ): Promise<ApplyDto | null> {
    const application = await this.prisma.job.findUnique({
      where: { id },
      include: { jobPost: true, candidate: true },
    });
    if (!application) return null;
    const roleValue = String(role);
    const canRead =
      roleValue === '0' ||
      (roleValue === '1' && application.jobPost.employerId === userId) ||
      (roleValue === '2' && application.candidateId === userId);
    if (!canRead) {
      throw new ForbiddenException('Bạn không có quyền xem đơn này.');
    }
    return this.toApplyDto(application, roleValue === '2');
  }

  async withdraw(id: string, candidateId: string, expectedVersion: number, reason?: string): Promise<ApplyDto | null> {
    if (!reason?.trim()) throw new BadRequestException('Cần cung cấp lý do rút hồ sơ.');
    const application = await this.prisma.job.findUnique({
      where: { id }, include: { jobPost: true, candidate: true },
    });
    if (!application || application.candidateId !== candidateId) return null;
    if (([ApplyStatus.Hired, ApplyStatus.Rejected, ApplyStatus.Withdrawn] as ApplyStatus[]).includes(application.status))
      throw new BadRequestException('Hồ sơ đã ở trạng thái kết thúc.');
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.job.updateMany({
        where: { id, version: expectedVersion },
        data: { status: ApplyStatus.Withdrawn, version: { increment: 1 } },
      });
      if (updated.count !== 1) {
        const current = await tx.job.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await tx.applicationStatusHistory.create({ data: {
        applicationId: id, fromStatus: application.status, toStatus: ApplyStatus.Withdrawn,
        changedBy: candidateId, reason: reason.trim(),
      }});
      await this.audit?.add(tx, {
        actorId: candidateId, action: 'Application.Withdrawn', entityType: 'Application', entityId: id,
        before: { status: application.status }, after: { status: ApplyStatus.Withdrawn, reason: reason.trim() },
      });
      await this.outbox?.add(tx, 'application.status.changed', {
        applicationId: id, candidateId, candidateEmail: application.candidate.email,
        jobTitle: application.jobPost.title, fromStatus: application.status, toStatus: ApplyStatus.Withdrawn,
      } as Prisma.InputJsonValue, `application:${id}:status:Withdrawn`);
    });
    return this.toApplyDto({ ...application, status: ApplyStatus.Withdrawn, version: application.version + 1 }, true);
  }

  async getHistory(id: string, userId: string, role: string | number) {
    const application = await this.prisma.job.findUnique({
      where: { id }, select: { candidateId: true, jobPost: { select: { employerId: true } } },
    });
    if (!application) return null;
    const roleValue = String(role);
    if (roleValue !== '0' && application.candidateId !== userId && application.jobPost.employerId !== userId)
      throw new ForbiddenException('Bạn không có quyền xem lịch sử hồ sơ.');
    return this.prisma.applicationStatusHistory.findMany({
      where: { applicationId: id }, orderBy: [{ changedAt: 'asc' }, { id: 'asc' }],
    });
  }

  private toApplyDto(j: {
    id: string;
    candidateId: string;
    candidate: { fullName: string };
    jobPostId: string;
    jobPost: { title: string };
    cvUrl: string | null;
    status: ApplyStatus;
    appliedAt: Date;
    version?: number;
  }, isCandidateSelf = false): ApplyDto {
    return {
      id: j.id,
      candidateId: j.candidateId,
      candidateName: j.candidate.fullName,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      cvUrl: j.cvUrl
        ? isCandidateSelf
          ? '/api/candidate-profile/me/cv'
          : `/api/candidate-profile/recruiter/${j.candidateId}/cv`
        : '',
      status: j.status as string,
      appliedAt: j.appliedAt,
      version: j.version === undefined ? undefined : encodeVersion(j.version),
    };
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
