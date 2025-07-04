import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { IJobPostService } from './job-post.iservice';

@Injectable()
// Service xử lý logic job post
export class JobPostService implements IJobPostService {
  // Inject PrismaService để thao tác DB
  constructor(private readonly prisma: PrismaService) {}

  // Tạo job post mới
  async create(employerId: string, dto: CreateJobPostDto): Promise<any> {
    // Tạo job post mới, bổ sung các trường bắt buộc: applicants (mảng rỗng), categoryId
    // Tạo job post mới, bổ sung các trường bắt buộc: applicants (số lượng ứng viên), categoryId
    return this.prisma.jobPost.create({
      data: {
        ...dto,
        employerId,
        applicants: 0, // nếu applicants là số lượng, khởi tạo = 0
        categoryId: (dto as any).categoryId, // ép kiểu nếu DTO chưa có, cần bổ sung vào DTO
      },
    });
  }

  // Cập nhật job post
  async update(id: string, dto: UpdateJobPostDto): Promise<any> {
    return this.prisma.jobPost.update({
      where: { id },
      data: dto,
    });
  }

  // Xóa job post
  async delete(id: string): Promise<boolean> {
    await this.prisma.jobPost.delete({ where: { id } });
    return true;
  }

  // Lấy chi tiết job post theo id, trả về 404 nếu không tìm thấy
  async getById(id: string) {
    const jobPost = await this.prisma.jobPost.findUnique({ where: { id } });
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
    const jobs = await this.prisma.jobPost.findMany();
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
    return this.prisma.jobPost.findMany({ where: { employerId } });
  }

  // Lấy job post theo công ty
  async getByCompany(companyId: string): Promise<any[]> {
    // Lấy tất cả job post thuộc companyId, parse tags
    const jobs = await this.prisma.jobPost.findMany({ where: { companyId } });
    return jobs.map(this.parseTags);
  }

  // Lấy job post theo ngành nghề (category)
  async getByCategory(categoryId: string): Promise<any[]> {
    const jobs = await this.prisma.jobPost.findMany({ where: { categoryId } });
    return jobs.map(this.parseTags);
  }
}
