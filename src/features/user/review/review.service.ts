// Service xử lý review cho user
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewDto, CreateReviewRequest } from './review.dto';
import { IReviewService } from './review.iservice';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả review
  async getAllAsync(): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      companyId: r.companyId,
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.createdAt,
    }));
  }

  // Lấy review theo companyId
  async getByCompanyAsync(companyId: string): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      companyId: r.companyId,
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.createdAt,
    }));
  }

  // Tạo mới review, kiểm tra userId hợp lệ
  async createAsync(
    userId: string,
    request: CreateReviewRequest,
  ): Promise<void> {
    try {
      if (!userId) {
        throw new Error('Thiếu thông tin user, vui lòng đăng nhập lại!');
      }
      await this.prisma.review.create({
        data: {
          userId,
          companyId: request.companyId,
          rating: request.rating,
          comment: request.comment,
          createdAt: new Date(),
        },
      });
      await this.updateCompanyRatingAsync(request.companyId);
    } catch (error) {
      console.error('Error in createAsync:', error);
      throw error;
    }
  }

  // Cập nhật rating trung bình cho công ty
  private async updateCompanyRatingAsync(companyId: string) {
    const avg = await this.prisma.review.aggregate({
      where: { companyId },
      _avg: { rating: true },
    });
    await this.prisma.company.update({
      where: { id: companyId },
      data: { rating: avg._avg.rating || 0 },
    });
  }
}
