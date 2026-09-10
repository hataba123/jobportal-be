import { Injectable, NotFoundException } from '@nestjs/common';
import { Optional } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ICompanyService } from './company.iservice';
import {
  CompanyDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateCompanyVerificationDto,
} from './company.dto';

import { AuditLogService } from '../../../common/audit/audit-log.service';
import { concurrencyConflict, encodeVersion } from '../../../common/concurrency/concurrency';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

// Service xử lý logic quản lý công ty
@Injectable()
export class CompanyService implements ICompanyService {
  constructor(private readonly prisma: PrismaService, @Optional() private readonly audit?: AuditLogService) {}

  // Lấy tất cả công ty
  // Lấy tất cả công ty, ép null về undefined cho các trường nullable
  async getAllCompanies(): Promise<CompanyDto[]> {
    const companies = await this.prisma.company.findMany({
      where: { deletedAt: null },
    });
    return companies.map((c) => this.toDto(c));
  }

  // Lấy chi tiết công ty
  // Lấy chi tiết công ty, ép null về undefined cho các trường nullable
  async getCompanyById(id: string): Promise<CompanyDto | null> {
    const c = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    return c ? this.toDto(c) : null;
  }

  // Tạo mới công ty
  // Tạo mới công ty, trả về DTO chuẩn
  async createCompany(dto: CreateCompanyDto): Promise<CompanyDto> {
    const c = await this.prisma.company.create({ data: dto });
    return this.toDto(c);
  }
  // Hàm chuyển entity sang DTO, ép null về undefined cho các trường nullable
  // Chuyển entity sang DTO, ép null về undefined, chuẩn hóa tags thành mảng string nếu có
  private toDto(entity: any): CompanyDto {
    let tags: string[] = [];
    if (Array.isArray(entity.tags)) {
      tags = entity.tags;
    } else if (typeof entity.tags === 'string') {
      // Nếu tags là chuỗi, tách theo dấu phẩy
      tags = entity.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    return {
      id: entity.id,
      name: entity.name,
      logo: entity.logo ?? undefined,
      description: entity.description ?? undefined,
      location: entity.location ?? undefined,
      employees: entity.employees ?? undefined,
      industry: entity.industry ?? undefined,
      openJobs: entity.openJobs,
      rating: entity.rating,
      website: entity.website ?? undefined,
      founded: entity.founded ?? undefined,
      tags,
      verificationStatus: entity.verificationStatus,
      verifiedAt: entity.verifiedAt ?? undefined,
      version: encodeVersion(entity.version ?? 0),
    };
  }

  // Cập nhật công ty
  // Cập nhật công ty, chuẩn hóa tags về string nếu FE gửi lên là mảng
  async updateCompany(id: string, dto: UpdateCompanyDto, expectedVersion?: number): Promise<boolean> {
    const c = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!c) return false;
    // Nếu FE gửi tags là mảng, convert về string trước khi update
    let data: any = { ...dto };
    if (Array.isArray(dto.tags)) {
      data.tags = dto.tags.join(',');
    }
    if (expectedVersion === undefined) {
      await this.prisma.company.update({ where: { id }, data });
    } else {
      const updated = await this.prisma.company.updateMany({ where: { id, deletedAt: null, version: expectedVersion }, data: { ...data, version: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await this.prisma.company.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
    }
    await this.audit?.add(this.prisma, { action: 'Company.Updated', entityType: 'Company', entityId: id, after: { fields: Object.keys(dto) } });
    return true;
  }

  // Xóa công ty
  async deleteCompany(id: string, expectedVersion?: number): Promise<boolean> {
    const c = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!c) return false;
    const deletedAt = new Date();
    if (expectedVersion === undefined) {
      await this.prisma.company.update({ where: { id }, data: { deletedAt } });
      return true;
    }
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.company.updateMany({ where: { id, deletedAt: null, version: expectedVersion }, data: { deletedAt, version: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await tx.company.findUnique({ where: { id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await tx.jobPost.updateMany({ where: { companyId: id, deletedAt: null }, data: { deletedAt, status: 'Closed', version: { increment: 1 } } });
      await this.audit?.add(tx, { action: 'Company.Deleted', entityType: 'Company', entityId: id, after: { deletedAt } });
    });
    return true;
  }

  async getAllCompaniesPaged(query: PageQueryDto): Promise<PagedResult<CompanyDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const keyword = query.keyword?.trim();
    const where: any = {
      deletedAt: null,
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { location: { contains: keyword, mode: 'insensitive' } },
              { industry: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const sortFields: Record<string, string> = {
      name: 'name',
      createdAt: 'createdAt',
      rating: 'rating',
      openJobs: 'openJobs',
      location: 'location',
    };
    const sortBy = sortFields[query.sortBy ?? ''] ?? 'name';
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    const [totalCount, companies] = await this.prisma.$transaction([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
        where,
        orderBy: [{ [sortBy]: sortDir }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = companies.map((c) => this.toDto(c));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  async updateVerificationStatus(
    id: string,
    dto: UpdateCompanyVerificationDto,
    expectedVersion?: number,
  ): Promise<CompanyDto | null> {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) return null;

    if (expectedVersion === undefined) {
      const updated = await this.prisma.company.update({ where: { id }, data: {
        verificationStatus: dto.verificationStatus,
        verifiedAt: dto.verificationStatus === 'Verified' ? new Date() : null,
      } });
      return this.toDto(updated);
    }
    const result = await this.prisma.company.updateMany({ where: { id, deletedAt: null, version: expectedVersion }, data: {
        verificationStatus: dto.verificationStatus,
        verifiedAt:
          dto.verificationStatus === 'Verified' ? new Date() : null,
        version: { increment: 1 },
      } });
    if (result.count !== 1) {
      const current = await this.prisma.company.findUnique({ where: { id }, select: { version: true } });
      throw concurrencyConflict(current?.version ?? 0);
    }
    const updated = await this.prisma.company.findUniqueOrThrow({ where: { id } });
    await this.audit?.add(this.prisma, { action: 'Company.VerificationChanged', entityType: 'Company', entityId: id, after: { status: dto.verificationStatus } });
    return this.toDto(updated);
  }
}
