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

  // Lấy chi tiết job post
  async getById(id: string): Promise<any> {
    return this.prisma.jobPost.findUnique({ where: { id } });
  }

  // Lấy tất cả job post
  async getAll(): Promise<any[]> {
    return this.prisma.jobPost.findMany();
  }

  // Lấy job post theo employer
  async getByEmployer(employerId: string): Promise<any[]> {
    return this.prisma.jobPost.findMany({ where: { employerId } });
  }
}
