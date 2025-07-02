// Service xử lý logic review cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewDto, UpdateReviewDto } from './review.dto';
import { IReviewService } from './review.iservice';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả review
  async getAllReviews(): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany();
    return reviews.map((r) => this.toDto(r));
  }

  // Lấy review theo id
  async getReviewById(id: string): Promise<ReviewDto | null> {
    const r = await this.prisma.review.findUnique({ where: { id } });
    return r ? this.toDto(r) : null;
  }

  // Cập nhật review
  async updateReview(id: string, dto: UpdateReviewDto): Promise<boolean> {
    try {
      const r = await this.prisma.review.update({ where: { id }, data: dto });
      return !!r;
    } catch {
      return false;
    }
  }

  // Xóa review
  async deleteReview(id: string): Promise<boolean> {
    try {
      const r = await this.prisma.review.delete({ where: { id } });
      return !!r;
    } catch {
      return false;
    }
  }

  // Chuyển entity sang DTO
  private toDto(entity: any): ReviewDto {
    return {
      id: entity.id,
      userId: entity.userId,
      companyId: entity.companyId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt,
    };
  }
}
