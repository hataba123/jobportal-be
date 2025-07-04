// Service xử lý logic công ty cho recruiter
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecruiterCompanyDto, RecruiterUpdateCompanyDto } from './company.dto';
import { IRecruiterCompanyService } from './company.iservice';

// Service thao tác công ty cho recruiter
@Injectable()
export class RecruiterCompanyService implements IRecruiterCompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy công ty mà recruiter đang quản lý (dựa vào jobPost)
  async getMyCompany(employerId: string): Promise<RecruiterCompanyDto | null> {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: { employerId, companyId: { not: null } },
      include: { company: true },
    });
    if (!jobPost?.company) return null;
    return this.toDto(jobPost.company);
  }

  // Cập nhật thông tin công ty của recruiter
  async updateMyCompany(
    employerId: string,
    dto: RecruiterUpdateCompanyDto,
  ): Promise<boolean> {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: { employerId, companyId: { not: null } },
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
    await this.prisma.company.update({
      where: { id: jobPost.company.id },
      data,
    });
    return true;
  }

  // Xóa công ty nếu không còn job post nào
  async deleteMyCompany(employerId: string): Promise<boolean> {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: { employerId, companyId: { not: null } },
      include: { company: true },
    });
    if (!jobPost?.company) return false;
    const count = await this.prisma.jobPost.count({
      where: { companyId: jobPost.company.id },
    });
    if (count > 0) return false;
    await this.prisma.company.delete({ where: { id: jobPost.company.id } });
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
    };
  }
}
