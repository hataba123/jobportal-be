import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICompanyService } from './company.iservice';
import { CompanyDto, CreateCompanyDto, UpdateCompanyDto } from './company.dto';

// Service xử lý logic quản lý công ty
@Injectable()
export class CompanyService implements ICompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả công ty
  // Lấy tất cả công ty, ép null về undefined cho các trường nullable
  async getAllCompanies(): Promise<CompanyDto[]> {
    const companies = await this.prisma.company.findMany();
    return companies.map((c) => this.toDto(c));
  }

  // Lấy chi tiết công ty
  // Lấy chi tiết công ty, ép null về undefined cho các trường nullable
  async getCompanyById(id: string): Promise<CompanyDto | null> {
    const c = await this.prisma.company.findUnique({ where: { id } });
    return c ? this.toDto(c) : null;
  }

  // Tạo mới công ty
  // Tạo mới công ty, trả về DTO chuẩn
  async createCompany(dto: CreateCompanyDto): Promise<CompanyDto> {
    const c = await this.prisma.company.create({ data: dto });
    return this.toDto(c);
  }
  // Hàm chuyển entity sang DTO, ép null về undefined cho các trường nullable
  private toDto(entity: any): CompanyDto {
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

  // Cập nhật công ty
  async updateCompany(id: string, dto: UpdateCompanyDto): Promise<boolean> {
    const c = await this.prisma.company.findUnique({ where: { id } });
    if (!c) return false;
    await this.prisma.company.update({ where: { id }, data: dto });
    return true;
  }

  // Xóa công ty
  async deleteCompany(id: string): Promise<boolean> {
    const c = await this.prisma.company.findUnique({ where: { id } });
    if (!c) return false;
    await this.prisma.company.delete({ where: { id } });
    return true;
  }
}
