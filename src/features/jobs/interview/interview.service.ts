import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplyStatus, InterviewResult, InterviewStatus, InterviewType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../common/audit/audit-log.service';
import { OutboxService } from '../../../common/outbox/outbox.service';
import { concurrencyConflict, decodeVersion, encodeVersion } from '../../../common/concurrency/concurrency';
import { CreateInterviewDto, UpdateInterviewDto, CompleteInterviewDto, InterviewQueryDto } from './interview.dto';

@Injectable()
export class InterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly outbox: OutboxService,
  ) {}

  async create(applicationId: string, actorId: string, request: CreateInterviewDto, applicationVersion: number) {
    const app = await this.prisma.job.findUnique({
      where: { id: applicationId },
      include: { jobPost: true, candidate: { select: { id: true, email: true, fullName: true } } },
    });
    if (!app) throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển.');
    if (app.jobPost.employerId !== actorId) throw new ForbiddenException('Bạn không có quyền lên lịch cho hồ sơ này.');
    if (app.status !== ApplyStatus.Screening) throw new BadRequestException('Chỉ có thể lên lịch khi hồ sơ đang ở bước Screening.');
    const start = this.validate(request.type, request.startAt, request.endAt, request.location, request.meetingUrl);
    const end = new Date(request.endAt);
    await this.ensureNoOverlap(actorId, start, end);
    const interviewId = crypto.randomUUID();
    const created = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.job.updateMany({ where: { id: applicationId, version: applicationVersion, status: ApplyStatus.Screening }, data: { status: ApplyStatus.Interview, version: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await tx.job.findUnique({ where: { id: applicationId }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      const interview = await tx.interview.create({ data: {
        id: interviewId, applicationId, type: request.type, startAt: start, endAt: end,
        location: request.location, meetingUrl: request.meetingUrl, interviewerId: actorId,
        status: InterviewStatus.Scheduled, result: InterviewResult.Pending, notes: request.notes,
      }});
      await tx.applicationStatusHistory.create({ data: { applicationId, fromStatus: ApplyStatus.Screening, toStatus: ApplyStatus.Interview, changedBy: actorId, reason: 'Interview scheduled' } });
      await this.audit.add(tx, { actorId, action: 'Interview.Created', entityType: 'Interview', entityId: interviewId, after: { applicationId, type: request.type, startAt: start, endAt: end } });
      await this.audit.add(tx, { actorId, action: 'Application.StatusChanged', entityType: 'Application', entityId: applicationId, before: { status: ApplyStatus.Screening }, after: { status: ApplyStatus.Interview, interviewId } });
      await this.outbox.add(tx, 'interview.scheduled', { interviewId, applicationId, candidateId: app.candidateId, candidateEmail: app.candidate.email, jobTitle: app.jobPost.title, startAt: start, endAt: end, location: request.location, meetingUrl: request.meetingUrl } as Prisma.InputJsonValue, `interview:${interviewId}:scheduled`);
      return interview;
    });
    return this.toDto({ ...created, application: { ...app, status: ApplyStatus.Interview } });
  }

  async list(actorId: string, role: string | number, query: InterviewQueryDto) {
    const roleValue = String(role);
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: Prisma.InterviewWhereInput = {
      ...(query.applicationId ? { applicationId: query.applicationId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(roleValue === '0' ? {} : roleValue === '2'
        ? { application: { candidateId: actorId } }
        : { application: { jobPost: { employerId: actorId } } }),
    };
    const [total, interviews] = await this.prisma.$transaction([
      this.prisma.interview.count({ where }),
      this.prisma.interview.findMany({ where, include: this.include(), orderBy: [{ startAt: 'asc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { items: interviews.map((item) => this.toDto(item)), totalCount: total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async get(id: string, actorId: string, role: string | number) {
    const item = await this.prisma.interview.findUnique({ where: { id }, include: this.include() });
    if (!item) return null;
    this.assertAccess(item, actorId, role);
    return this.toDto(item);
  }

  async update(id: string, actorId: string, role: string | number, request: UpdateInterviewDto, expectedVersion: number) {
    const item = await this.prisma.interview.findUnique({ where: { id }, include: this.include() });
    if (!item) return null;
    this.assertManager(item, actorId, role);
    if (item.status !== InterviewStatus.Scheduled) throw new BadRequestException('Chỉ có thể cập nhật lịch đang Scheduled.');
    const type = request.type ?? item.type;
    const startValue = request.startAt ?? item.startAt.toISOString();
    const endValue = request.endAt ?? item.endAt.toISOString();
    const start = this.validate(type, startValue, endValue, request.location ?? item.location ?? undefined, request.meetingUrl ?? item.meetingUrl ?? undefined);
    const end = new Date(endValue);
    await this.ensureNoOverlap(item.interviewerId, start, end, id);
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.interview.updateMany({ where: { id, version: expectedVersion, status: InterviewStatus.Scheduled }, data: { type, startAt: start, endAt: end, location: request.location ?? item.location, meetingUrl: request.meetingUrl ?? item.meetingUrl, notes: request.notes ?? item.notes, updatedAt: new Date(), version: { increment: 1 } } });
      if (result.count !== 1) {
        const current = await tx.interview.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit.add(tx, { actorId, action: 'Interview.Updated', entityType: 'Interview', entityId: id, before: { startAt: item.startAt, endAt: item.endAt }, after: { startAt: start, endAt: end } });
      await this.outbox.add(tx, 'interview.rescheduled', { interviewId: id, applicationId: item.applicationId, startAt: start, endAt: end } as Prisma.InputJsonValue, `interview:${id}:updated:${start.getTime()}`);
      return tx.interview.findUniqueOrThrow({ where: { id }, include: this.include() });
    });
    return this.toDto(updated);
  }

  async complete(id: string, actorId: string, role: string | number, request: CompleteInterviewDto, expectedInterviewVersion: number, expectedApplicationVersion: number) {
    const item = await this.prisma.interview.findUnique({ where: { id }, include: this.include() });
    if (!item) return null;
    this.assertManager(item, actorId, role);
    if (item.status !== InterviewStatus.Scheduled) throw new BadRequestException('Chỉ có thể hoàn tất lịch đang Scheduled.');
    const target = request.result === InterviewResult.Passed ? ApplyStatus.Offer : ApplyStatus.Rejected;
    const updated = await this.prisma.$transaction(async (tx) => {
      const interview = await tx.interview.updateMany({ where: { id, version: expectedInterviewVersion, status: InterviewStatus.Scheduled }, data: { status: InterviewStatus.Completed, result: request.result, notes: request.notes ?? item.notes, updatedAt: new Date(), version: { increment: 1 } } });
      if (interview.count !== 1) {
        const current = await tx.interview.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      const application = await tx.job.updateMany({ where: { id: item.applicationId, version: expectedApplicationVersion, status: ApplyStatus.Interview }, data: { status: target, version: { increment: 1 } } });
      if (application.count !== 1) {
        const current = await tx.job.findUnique({ where: { id: item.applicationId }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await tx.applicationStatusHistory.create({ data: { applicationId: item.applicationId, fromStatus: ApplyStatus.Interview, toStatus: target, changedBy: actorId, reason: `Interview result: ${request.result}` } });
      await this.audit.add(tx, { actorId, action: 'Interview.Completed', entityType: 'Interview', entityId: id, before: { status: item.status, result: item.result }, after: { status: InterviewStatus.Completed, result: request.result } });
      await this.audit.add(tx, { actorId, action: 'Application.StatusChanged', entityType: 'Application', entityId: item.applicationId, before: { status: ApplyStatus.Interview }, after: { status: target } });
      await this.outbox.add(tx, 'application.status.changed', { applicationId: item.applicationId, candidateId: item.application.candidateId, candidateEmail: item.application.candidate.email, jobTitle: item.application.jobPost.title, fromStatus: ApplyStatus.Interview, toStatus: target } as Prisma.InputJsonValue, `application:${item.applicationId}:status:${target}`);
      return tx.interview.findUniqueOrThrow({ where: { id }, include: this.include() });
    });
    return this.toDto(updated);
  }

  async cancel(id: string, actorId: string, role: string | number, expectedVersion: number) {
    const item = await this.prisma.interview.findUnique({ where: { id }, include: this.include() });
    if (!item) return null;
    this.assertManager(item, actorId, role);
    if (item.status !== InterviewStatus.Scheduled) throw new BadRequestException('Chỉ có thể hủy lịch đang Scheduled.');
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.interview.updateMany({ where: { id, version: expectedVersion, status: InterviewStatus.Scheduled }, data: { status: InterviewStatus.Cancelled, updatedAt: new Date(), version: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await tx.interview.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit.add(tx, { actorId, action: 'Interview.Cancelled', entityType: 'Interview', entityId: id, before: { status: InterviewStatus.Scheduled }, after: { status: InterviewStatus.Cancelled } });
      return tx.interview.findUniqueOrThrow({ where: { id }, include: this.include() });
    });
    return this.toDto(result);
  }

  private include() {
    return { application: { include: { jobPost: true, candidate: { select: { id: true, email: true, fullName: true } } } } } as const;
  }

  private assertAccess(item: any, actorId: string, role: string | number) {
    if (String(role) === '0') return;
    if (String(role) === '2' && item.application.candidateId === actorId) return;
    if (String(role) === '1' && item.application.jobPost.employerId === actorId) return;
    throw new ForbiddenException('Bạn không có quyền xem lịch phỏng vấn.');
  }

  private assertManager(item: any, actorId: string, role: string | number) {
    if (String(role) === '0') return;
    if (String(role) !== '1' || item.application.jobPost.employerId !== actorId)
      throw new ForbiddenException('Bạn không có quyền quản lý lịch phỏng vấn.');
  }

  private async ensureNoOverlap(interviewerId: string, startAt: Date, endAt: Date, ignoredId?: string) {
    const overlap = await this.prisma.interview.findFirst({ where: { interviewerId, status: InterviewStatus.Scheduled, ...(ignoredId ? { id: { not: ignoredId } } : {}), startAt: { lt: endAt }, endAt: { gt: startAt } } });
    if (overlap) throw new ConflictException('Interviewer đã có lịch trùng trong khoảng thời gian này.');
  }

  private validate(type: InterviewType, startValue: string, endValue: string, location?: string, meetingUrl?: string) {
    const start = new Date(startValue);
    const end = new Date(endValue);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new BadRequestException('Thời gian phỏng vấn không hợp lệ.');
    if (start <= new Date()) throw new BadRequestException('Thời gian phỏng vấn phải ở tương lai.');
    if (end <= start) throw new BadRequestException('EndAt phải lớn hơn StartAt.');
    if (type === InterviewType.Online && (!meetingUrl || !/^https:\/\//i.test(meetingUrl))) throw new BadRequestException('Phỏng vấn online cần MeetingUrl HTTPS hợp lệ.');
    if (type === InterviewType.Onsite && !location?.trim()) throw new BadRequestException('Phỏng vấn onsite cần Location.');
    if (type === InterviewType.Phone && !location?.trim() && !meetingUrl?.trim()) throw new BadRequestException('Phỏng vấn phone cần thông tin liên hệ.');
    return start;
  }

  private toDto(item: any) {
    return {
      id: item.id, applicationId: item.applicationId, jobPostId: item.application.jobPostId,
      candidateId: item.application.candidateId, candidateName: item.application.candidate.fullName,
      jobTitle: item.application.jobPost.title, type: item.type, startAt: item.startAt, endAt: item.endAt,
      location: item.location, meetingUrl: item.meetingUrl, interviewerId: item.interviewerId,
      status: item.status, result: item.result, notes: item.notes, createdAt: item.createdAt,
      updatedAt: item.updatedAt, version: encodeVersion(item.version), applicationVersion: encodeVersion(item.application.version),
    };
  }
}
