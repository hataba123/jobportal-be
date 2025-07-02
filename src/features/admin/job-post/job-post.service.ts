// Service xử lý logic job post cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobPostDto, CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { IJobPostService } from './job-post.iservice';

@Injectable()
export class JobPostService implements IJobPostService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả job post
  async getAllJobPosts(): Promise<JobPostDto[]> {
    const jobs = await this.prisma.jobPost.findMany();
    return jobs.map((j) => this.toDto(j));
  }

  // Lấy chi tiết job post
  async getJobPostById(id: string): Promise<JobPostDto | null> {
    const j = await this.prisma.jobPost.findUnique({ where: { id } });
    return j ? this.toDto(j) : null;
  }

  // Tạo mới job post
  // Tạo mới job post, chuyển đổi tags (mảng) sang string nếu cần
  async createJobPost(dto: CreateJobPostDto): Promise<JobPostDto> {
    const data: any = {
      ...dto,
      tags: Array.isArray(dto.tags) ? JSON.stringify(dto.tags) : dto.tags,
    };
    const j = await this.prisma.jobPost.create({ data });
    return this.toDto(j);
  }

  // Cập nhật job post
  // Cập nhật job post, chuyển đổi tags (mảng) sang string nếu cần
  async updateJobPost(id: string, dto: UpdateJobPostDto): Promise<boolean> {
    try {
      const data: any = {
        ...dto,
        tags: Array.isArray(dto.tags) ? JSON.stringify(dto.tags) : dto.tags,
      };
      const j = await this.prisma.jobPost.update({ where: { id }, data });
      return !!j;
    } catch {
      return false;
    }
  }

  // Xóa job post
  async deleteJobPost(id: string): Promise<boolean> {
    try {
      const j = await this.prisma.jobPost.delete({ where: { id } });
      return !!j;
    } catch {
      return false;
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
    };
  }
}
