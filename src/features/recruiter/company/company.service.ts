// Service xử lý logic công ty cho recruiter
import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RecruiterCompanyDto, RecruiterUpdateCompanyDto } from './company.dto';
import { IRecruiterCompanyService } from './company.iservice';
import { AuditLogService } from '../../../common/audit/audit-log.service';
import { concurrencyConflict, encodeVersion } from '../../../common/concurrency/concurrency';

// Service thao tác công ty cho recruiter
@Injectable()
export class RecruiterCompanyService implements IRecruiterCompanyService {
  constructor(private readonly prisma: PrismaService, @Optional() private readonly audit?: AuditLogService) {}

  // Lấy công ty mà recruiter đang quản lý (dựa vào jobPost)
  async getMyCompany(employerId: string): Promise<RecruiterCompanyDto | null> {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: {
        employerId,
        deletedAt: null,
        companyId: { not: null },
      },
      include: { company: true },
    });
    if (!jobPost?.company) return null;
    return this.toDto(jobPost.company);
  }

  // Cập nhật thông tin công ty của recruiter
  async updateMyCompany(
    employerId: string,
    dto: RecruiterUpdateCompanyDto,
    expectedVersion?: number,
  ): Promise<boolean> {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: {
        employerId,
        deletedAt: null,
        companyId: { not: null },
      },
      include: { company: true },
    });
    if (!jobPost?.company) return false;
    // Chuẩn hóa tags và founded: đảm bảo đúng type cho Prisma
    let founded = dto.founded;
    if (
      typeof founded !== 'string' &&
      founded !== undefined &&
      founded !== null
    ) {
      founded = String(founded);
    }
    if (typeof founded === 'string' && founded.length > 10) {
      founded = founded.slice(0, 10);
    }
    const data = {
      ...dto,
      founded,
      tags: Array.isArray(dto.tags) ? dto.tags.join(',') : (dto.tags ?? ''),
    };
    if (expectedVersion === undefined) {
      await this.prisma.company.update({ where: { id: jobPost.company.id }, data });
    } else {
      const updated = await this.prisma.company.updateMany({ where: { id: jobPost.company.id, version: expectedVersion, deletedAt: null }, data: { ...data, version: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await this.prisma.company.findUnique({ where: { id: jobPost.company.id }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
      await this.audit?.add(this.prisma, { actorId: employerId, action: 'Company.Updated', entityType: 'Company', entityId: jobPost.company.id, after: { fields: Object.keys(dto) } });
    }
    return true;
  }

  // Xóa công ty nếu không còn job post nào
  async deleteMyCompany(employerId: string, expectedVersion?: number): Promise<boolean> {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: {
        employerId,
        deletedAt: null,
        companyId: { not: null },
      },
      include: { company: true },
    });
    if (!jobPost?.company) return false;
    const count = await this.prisma.jobPost.count({
      where: { companyId: jobPost.company.id, deletedAt: null },
    });
    if (count > 0) return false;
    const companyId = jobPost.company.id;
    if (expectedVersion === undefined) {
      await this.prisma.company.delete({ where: { id: companyId } }).catch(async () => {
        await this.prisma.company.update({ where: { id: companyId }, data: { deletedAt: new Date() } });
      });
    } else {
      const updated = await this.prisma.company.updateMany({ where: { id: companyId, version: expectedVersion, deletedAt: null }, data: { deletedAt: new Date(), version: { increment: 1 } } });
      if (updated.count !== 1) {
        const current = await this.prisma.company.findUnique({ where: { id: companyId }, select: { version: true } });
        throw concurrencyConflict(current?.version ?? 0);
      }
    }
    return true;
  }

  // Chuyển entity sang DTO
  private toDto(entity: any): RecruiterCompanyDto {
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
      tags: entity.tags ?? undefined,
      verificationStatus: entity.verificationStatus,
      verifiedAt: entity.verifiedAt ?? undefined,
      version: encodeVersion(entity.version ?? 0),
    };
  }
}
