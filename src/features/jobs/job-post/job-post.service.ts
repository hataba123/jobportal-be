import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { IJobPostService } from './job-post.iservice';

@Injectable()
// Service xử lý logic job post
export class JobPostService implements IJobPostService {
  // Inject PrismaService để thao tác DB
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.jobPost.create({
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
        status: dto.status ?? 'Active',
        minExperienceYears: dto.minExperienceYears,
        educationRequirement: dto.educationRequirement,
        employerId,
        applicants: 0,
      },
    });
  }

  // Cập nhật job post
  async update(
    id: string,
    employerId: string,
    dto: UpdateJobPostDto,
  ): Promise<any> {
    const job = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Không tìm thấy job post.');
    }
    if (job.employerId !== employerId) {
      throw new ForbiddenException('Bạn không có quyền sửa tin này.');
    }
    return this.prisma.jobPost.update({
      where: { id },
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
      },
    });
  }

  // Xóa job post
  async delete(id: string, employerId: string): Promise<boolean> {
    const job = await this.prisma.jobPost.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Không tìm thấy job post.');
    }
    if (job.employerId !== employerId) {
      throw new ForbiddenException('Bạn không có quyền xóa tin này.');
    }
    await this.prisma.jobPost.delete({ where: { id } });
    return true;
  }

  // Lấy chi tiết job post theo id, trả về 404 nếu không tìm thấy
  async getById(id: string) {
    const jobPost = await this.prisma.jobPost.findFirst({
      where: {
        id,
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
  async getAll(): Promise<any[]> {
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map(this.parseTags);
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
    };
  };

  // Lấy job post theo employer
  async getByEmployer(employerId: string): Promise<any[]> {
    const jobs = await this.prisma.jobPost.findMany({ where: { employerId } });
    return jobs.map(this.parseTags);
  }

  // Lấy job post theo công ty
  async getByCompany(companyId: string): Promise<any[]> {
    // Lấy tất cả job post thuộc companyId, parse tags
    const jobs = await this.prisma.jobPost.findMany({
      where: {
        companyId,
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
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    return jobs.map(this.parseTags);
  }
}
