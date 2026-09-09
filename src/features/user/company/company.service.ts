// Service xử lý công ty cho user
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CompanyDto } from './company.dto';
import { ICompanyService } from './company.iservice';

@Injectable()
export class CompanyService implements ICompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả công ty
  async getAllAsync(): Promise<CompanyDto[]> {
    const companies = await this.prisma.company.findMany({
      where: { deletedAt: null, verificationStatus: 'Verified' },
    });
    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      logo: c.logo || undefined,
      description: c.description || undefined,
      location: c.location || undefined,
      employees: c.employees || undefined,
      industry: c.industry || undefined,
      openJobs: c.openJobs,
      rating: c.rating,
      website: c.website || undefined,
      founded: c.founded || undefined,
      tags: c.tags || undefined,
      verificationStatus: c.verificationStatus,
      verifiedAt: c.verifiedAt || undefined,
    }));
  }

  // Lấy công ty theo id
  async getByIdAsync(id: string): Promise<CompanyDto | null> {
    const c = await this.prisma.company.findFirst({
      where: { id, deletedAt: null, verificationStatus: 'Verified' },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      logo: c.logo || undefined,
      description: c.description || undefined,
      location: c.location || undefined,
      employees: c.employees || undefined,
      industry: c.industry || undefined,
      openJobs: c.openJobs,
      rating: c.rating,
      website: c.website || undefined,
      founded: c.founded || undefined,
      tags: c.tags || undefined,
      verificationStatus: c.verificationStatus,
      verifiedAt: c.verifiedAt || undefined,
    };
  }
}
