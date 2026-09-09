// Service xử lý saved job cho user
import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SavedJobDto } from './saved-job.dto';
import { ISavedJobService } from './saved-job.iservice';

@Injectable()
export class SavedJobService implements ISavedJobService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy danh sách job đã lưu
  async getSavedJobsAsync(userId: string): Promise<SavedJobDto[]> {
    const jobs = await this.prisma.savedJob.findMany({
      where: { userId },
      include: { jobPost: true },
      orderBy: { savedAt: 'desc' },
    });
    return jobs.map((j) => ({
      id: j.id,
      jobPostId: j.jobPostId,
      title: j.jobPost?.title || '',
      location: j.jobPost?.location || '',
      savedAt: j.savedAt,
    }));
  }

  // Lưu job
  // Lưu job, kiểm tra userId hợp lệ trước khi lưu
  async saveJobAsync(userId: string, jobPostId: string): Promise<void> {
    if (!userId) {
      throw new BadRequestException(
        'Thiếu thông tin user, vui lòng đăng nhập lại!',
      );
    }
    const jobPost = await this.prisma.jobPost.findFirst({
      where: {
        id: jobPostId,
        deletedAt: null,
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!jobPost) {
      throw new BadRequestException('Công việc không tồn tại hoặc đã hết hạn.');
    }
    const exists = await this.prisma.savedJob.findFirst({
      where: { userId, jobPostId },
    });
    if (exists) throw new BadRequestException('Bạn đã lưu công việc này rồi.');
    try {
      await this.prisma.savedJob.create({
        data: {
          userId,
          jobPostId,
          savedAt: new Date(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Bạn đã lưu công việc này rồi.');
      }
      throw error;
    }
  }

  // Bỏ lưu job
  async unsaveJobAsync(userId: string, jobPostId: string): Promise<boolean> {
    const job = await this.prisma.savedJob.findFirst({
      where: { userId, jobPostId },
    });
    if (!job) return false;
    await this.prisma.savedJob.delete({ where: { id: job.id } });
    return true;
  }
}
