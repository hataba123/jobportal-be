// Service xử lý logic job post cho admin
import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobPostDto, CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { IJobPostService } from './job-post.iservice';
import { AuditLogService } from '../../../common/audit/audit-log.service';
import { concurrencyConflict, encodeVersion } from '../../../common/concurrency/concurrency';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class JobPostService implements IJobPostService {
  constructor(private readonly prisma: PrismaService, @Optional() private readonly audit?: AuditLogService) {}

  // Lấy tất cả job post
  async getAllJobPosts(): Promise<JobPostDto[]> {
    const jobs = await this.prisma.jobPost.findMany({
      where: { deletedAt: null },
    });
    return jobs.map((j) => this.toDto(j));
  }

  async getAllJobPostsPaged(query: PageQueryDto): Promise<PagedResult<JobPostDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const keyword = query.keyword?.trim();
    const where: any = {
      deletedAt: null,
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
              { location: { contains: keyword, mode: 'insensitive' } },
              { skillsRequired: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const sortFields: Record<string, string> = {
      createdAt: 'createdAt',
      title: 'title',
      applicants: 'applicants',
      expiresAt: 'expiresAt',
      status: 'status',
    };
    const sortBy = sortFields[query.sortBy ?? ''] ?? 'createdAt';
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    const [totalCount, jobs] = await this.prisma.$transaction([
      this.prisma.jobPost.count({ where }),
      this.prisma.jobPost.findMany({
        where,
        orderBy: [{ [sortBy]: sortDir }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = jobs.map((j) => this.toDto(j));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  // Lấy chi tiết job post
  async getJobPostById(id: string): Promise<JobPostDto | null> {
    const j = await this.prisma.jobPost.findFirst({
      where: { id, deletedAt: null },
    });
    return j ? this.toDto(j) : null;
  }

  // Tạo mới job post
  // Tạo mới job post, chuyển đổi tags (mảng) sang string nếu cần
  async createJobPost(dto: CreateJobPostDto): Promise<JobPostDto> {
    const data: any = {
      ...dto,
      tags: Array.isArray(dto.tags) ? JSON.stringify(dto.tags) : dto.tags,
      status: dto.status ?? 'Active',
    };
    const j = await this.prisma.jobPost.create({ data });
    return this.toDto(j);
  }

  // Cập nhật job post
  // Cập nhật job post, chuyển đổi tags (mảng) sang string nếu cần
  async updateJobPost(id: string, dto: UpdateJobPostDto, expectedVersion?: number): Promise<boolean> {
    try {
      const data: any = {
      ...dto,
      tags: Array.isArray(dto.tags) ? JSON.stringify(dto.tags) : dto.tags,
      };
      const existing = await this.prisma.jobPost.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) return false;
      if (expectedVersion === undefined) {
        await this.prisma.jobPost.update({ where: { id }, data });
        return true;
      }
      data.version = { increment: 1 };
      const result = await this.prisma.jobPost.updateMany({ where: { id, deletedAt: null, version: expectedVersion }, data });
      if (result.count !== 1) {
        const current = await this.prisma.jobPost.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit?.add(this.prisma, { action: 'JobPost.Updated', entityType: 'JobPost', entityId: id, after: { fields: Object.keys(dto) } });
      return true;
    } catch (error) {
      if (error?.code === 'P2025') return false;
      throw error;
    }
  }

  // Xóa job post
  async deleteJobPost(id: string, expectedVersion?: number): Promise<boolean> {
    try {
      const existing = await this.prisma.jobPost.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) return false;
      if (expectedVersion === undefined) {
        await this.prisma.jobPost.update({ where: { id }, data: { deletedAt: new Date(), status: 'Closed' } });
        return true;
      }
      const result = await this.prisma.jobPost.updateMany({ where: { id, deletedAt: null, version: expectedVersion }, data: { deletedAt: new Date(), status: 'Closed', version: { increment: 1 } } });
      if (result.count !== 1) {
        const current = await this.prisma.jobPost.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit?.add(this.prisma, { action: 'JobPost.Deleted', entityType: 'JobPost', entityId: id, after: { status: 'Closed' } });
      return true;
    } catch (error) {
      if (error?.code === 'P2025') return false;
      throw error;
    }
  }

  // Chuyển entity sang DTO, ép null về undefined cho các trường nullable
  // Chuyển entity sang DTO, parse tags từ string sang mảng
  private toDto(entity: any): JobPostDto {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      skillsRequired: entity.skillsRequired ?? undefined,
      location: entity.location ?? undefined,
      salary: entity.salary,
      employerId: entity.employerId,
      companyId: entity.companyId ?? undefined,
      logo: entity.logo ?? undefined,
      type: entity.type ?? undefined,
      tags:
        typeof entity.tags === 'string'
          ? JSON.parse(entity.tags)
          : (entity.tags ?? []),
      applicants: entity.applicants,
      createdAt: entity.createdAt,
      categoryId: entity.categoryId,
      status: entity.status,
      expiresAt: entity.expiresAt ?? undefined,
      minExperienceYears: entity.minExperienceYears ?? undefined,
      educationRequirement: entity.educationRequirement ?? undefined,
      version: encodeVersion(entity.version ?? 0),
    };
  }
}
