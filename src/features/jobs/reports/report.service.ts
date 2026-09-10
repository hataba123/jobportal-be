import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JobReportStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../common/audit/audit-log.service';
import { OutboxService } from '../../../common/outbox/outbox.service';
import { concurrencyConflict, encodeVersion } from '../../../common/concurrency/concurrency';
import { CreateReportDto, ReportQueryDto } from './report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService, private readonly outbox: OutboxService) {}

  async create(actorId: string, dto: CreateReportDto) {
    const job = await this.prisma.jobPost.findUnique({ where: { id: dto.jobPostId }, include: { company: true } });
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại.');
    const report = await this.prisma.$transaction(async (tx) => {
      const created = await tx.jobReport.create({ data: { jobPostId: job.id, reporterId: actorId, reason: dto.reason.trim(), description: dto.description?.trim() } });
      await this.audit.add(tx, { actorId, action: 'JobReport.Created', entityType: 'JobReport', entityId: created.id, after: { jobPostId: job.id, reason: created.reason } });
      await this.outbox.add(tx, 'job-report.created', { reportId: created.id, jobPostId: job.id, title: job.title } as Prisma.InputJsonValue, `job-report:${created.id}:created`);
      return created;
    });
    return this.toDto(await this.findById(report.id));
  }

  async list(query: ReportQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: Prisma.JobReportWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { OR: [{ reason: { contains: query.search, mode: 'insensitive' } }, { jobPost: { title: { contains: query.search, mode: 'insensitive' } } }] } : {}),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.jobReport.count({ where }),
      this.prisma.jobReport.findMany({ where, include: { jobPost: { include: { company: true } }, reporter: { select: { email: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { items: rows.map((row) => this.toDto(row)), totalCount: total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async update(id: string, actorId: string, status: JobReportStatus, version: number) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.jobReport.updateMany({ where: { id, version }, data: { status, version: { increment: 1 }, resolvedAt: status === JobReportStatus.Pending ? null : new Date(), resolvedBy: status === JobReportStatus.Pending ? null : actorId } });
      if (result.count !== 1) {
        const current = await tx.jobReport.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit.add(tx, { actorId, action: 'JobReport.StatusChanged', entityType: 'JobReport', entityId: id, before: { status: existing.status }, after: { status } });
      return tx.jobReport.findUniqueOrThrow({ where: { id }, include: { jobPost: { include: { company: true } }, reporter: { select: { email: true } } } });
    });
    return this.toDto(updated);
  }

  private findById(id: string) {
    return this.prisma.jobReport.findUnique({ where: { id }, include: { jobPost: { include: { company: true } }, reporter: { select: { email: true } } } });
  }

  private toDto(row: any) {
    if (!row) return null;
    return { id: row.id, jobPostId: row.jobPostId, jobTitle: row.jobPost.title, companyName: row.jobPost.company?.name ?? '', reporterId: row.reporterId, reporterEmail: row.reporter.email, reason: row.reason, description: row.description, status: row.status, createdAt: row.createdAt, resolvedAt: row.resolvedAt, version: encodeVersion(row.version) };
  }
}
