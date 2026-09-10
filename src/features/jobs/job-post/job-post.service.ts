import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { IJobPostService } from './job-post.iservice';
import { PagedResult } from '../../../common/dto/pagination.dto';
import { AuditLogService } from '../../../common/audit/audit-log.service';
import { OutboxService } from '../../../common/outbox/outbox.service';
import { concurrencyConflict, encodeVersion } from '../../../common/concurrency/concurrency';

@Injectable()
// Service xử lý logic job post
export class JobPostService implements IJobPostService {
  // Inject PrismaService để thao tác DB
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly audit?: AuditLogService,
    @Optional() private readonly outbox?: OutboxService,
  ) {}

  // Tạo job post mới
  async create(employerId: string, dto: CreateJobPostDto): Promise<any> {
    if (!employerId) {
      throw new BadRequestException('Không xác định được nhà tuyển dụng.');
    }
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Danh mục công việc không tồn tại.');
    }

    // Tin do recruiter tạo không được tự chuyển sang Active. Admin sẽ duyệt
    // và chuyển trạng thái sau khi kiểm tra nội dung/công ty.
    const requestedStatus = dto.status ?? 'PendingApproval';
    if (!['Draft', 'PendingApproval'].includes(requestedStatus)) {
      throw new BadRequestException(
        'Recruiter chỉ được tạo tin ở trạng thái Draft hoặc PendingApproval.',
      );
    }

    const created = await this.prisma.jobPost.create({
      data: {
        title: dto.title,
        description: dto.description,
        skillsRequired: dto.skillsRequired,
        location: dto.location,
        salary: dto.salary,
        type: dto.type,
        tags: dto.tags ? JSON.stringify(dto.tags) : null,
        companyId: dto.companyId,
        categoryId: dto.categoryId,
        logo: dto.logo,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: requestedStatus,
        minExperienceYears: dto.minExperienceYears,
        educationRequirement: dto.educationRequirement,
        employerId,
        applicants: 0,
      },
    });
    return this.parseTags(created);
  }

  // Cập nhật job post
  async update(
    id: string,
    employerId: string,
    dto: UpdateJobPostDto,
    expectedVersion: number,
  ): Promise<any> {
    const job = await this.prisma.jobPost.findFirst({
      where: { id, employerId, deletedAt: null },
    });
    if (!job) {
      throw new NotFoundException('Không tìm thấy job post.');
    }
    if (dto.status && !['Draft', 'PendingApproval'].includes(dto.status)) {
      throw new BadRequestException('Recruiter không được tự chuyển tin sang trạng thái này.');
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.jobPost.updateMany({
        where: { id, employerId, deletedAt: null, version: expectedVersion },
        data: {
          title: dto.title,
          description: dto.description,
          skillsRequired: dto.skillsRequired,
          location: dto.location,
          salary: dto.salary,
          type: dto.type,
          tags: dto.tags ? JSON.stringify(dto.tags) : undefined,
          companyId: dto.companyId,
          categoryId: dto.categoryId,
          logo: dto.logo,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          status: dto.status,
          minExperienceYears: dto.minExperienceYears,
          educationRequirement: dto.educationRequirement,
          version: { increment: 1 },
        },
      });
      if (updated.count !== 1) {
        const current = await tx.jobPost.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit?.add(tx, { actorId: employerId, action: 'JobPost.Updated', entityType: 'JobPost', entityId: id, after: { fields: Object.keys(dto) } });
      return tx.jobPost.findUniqueOrThrow({ where: { id } });
    });
    return this.parseTags(result);
  }

  // Xóa job post
  async delete(id: string, employerId: string, expectedVersion: number): Promise<boolean> {
    const job = await this.prisma.jobPost.findFirst({
      where: { id, employerId, deletedAt: null },
    });
    if (!job) {
      throw new NotFoundException('Không tìm thấy job post.');
    }
    const updated = await this.prisma.jobPost.updateMany({ where: { id, employerId, deletedAt: null, version: expectedVersion }, data: { deletedAt: new Date(), status: 'Closed', version: { increment: 1 } } });
    if (updated.count !== 1) {
      const current = await this.prisma.jobPost.findUnique({ where: { id }, select: { version: true } });
      throw concurrencyConflict(current?.version ?? 0);
    }
    await this.audit?.add(this.prisma, { actorId: employerId, action: 'JobPost.Deleted', entityType: 'JobPost', entityId: id, after: { status: 'Closed' } });
    return true;
  }

  // Lấy chi tiết job post theo id, trả về 404 nếu không tìm thấy
  async getById(id: string) {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: {
        id,
        deletedAt: null,
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    console.log('JobPost from DB:', jobPost);
    if (!jobPost) {
      // Ném lỗi 404 nếu không tìm thấy
      throw new NotFoundException('Không tìm thấy job post');
    }
    // Trả về job post đã parse tags (chuẩn hóa contract cho FE)
    return this.parseTags(jobPost);
  }

  // Lấy tất cả job post
  async getAll(page = 1, pageSize = 20): Promise<PagedResult<any>> {
    const where = {
      status: 'Active' as const,
      deletedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };
    const [total, jobs] = await Promise.all([
      this.prisma.jobPost.count({ where }),
      this.prisma.jobPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      items: jobs.map(this.parseTags),
      total,
      totalCount: total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Hàm parse tags từ string sang mảng (fix lỗi FE .map, chống lỗi JSON.parse)
  private parseTags = (job: any) => {
    if (!job) return job;
    let tags = job.tags;
    if (typeof tags === 'string') {
      try {
        // Nếu là JSON hợp lệ thì parse, nếu là chuỗi array không hợp lệ thì convert
        if (tags.trim().startsWith('[') && tags.trim().endsWith(']')) {
          tags = JSON.parse(tags);
        } else {
          // Trường hợp lưu kiểu '[seo, ads, ...]' (không có dấu ")
          tags = tags
            .replace(/\[|\]/g, '')
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t);
        }
      } catch {
        // Nếu parse lỗi thì trả về mảng rỗng
        tags = [];
      }
    } else if (!Array.isArray(tags)) {
      tags = [];
    }
    return {
      ...job,
      tags,
      version: encodeVersion(job.version ?? 0),
    };
  };

  // Lấy job post theo employer
  async getByEmployer(employerId: string): Promise<any[]> {
    const jobs = await this.prisma.jobPost.findMany({
      where: { employerId, deletedAt: null },
    });
    return jobs.map(this.parseTags);
  }

  // Lấy job post theo công ty
  async getByCompany(companyId: string): Promise<any[]> {
    // Lấy tất cả job post thuộc companyId, parse tags
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    return jobs.map(this.parseTags);
  }

  // Lấy job post theo ngành nghề (category)
  async getByCategory(categoryId: string): Promise<any[]> {
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        categoryId,
        deletedAt: null,
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    return jobs.map(this.parseTags);
  }
}
