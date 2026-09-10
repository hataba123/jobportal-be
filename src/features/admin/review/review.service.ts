// Service xử lý logic review cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReviewDto, UpdateReviewDto } from './review.dto';
import { IReviewService } from './review.iservice';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả review
  async getAllReviews(): Promise<ReviewDto[]> {
    const reviews = await this.prisma.review.findMany();
    return reviews.map((r) => this.toDto(r));
  }

  async getAllReviewsPaged(query: PageQueryDto): Promise<PagedResult<ReviewDto>> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const keyword = query.keyword?.trim();
    const where: any = keyword
      ? { comment: { contains: keyword, mode: 'insensitive' } }
      : {};
    const sortFields: Record<string, string> = { createdAt: 'createdAt', rating: 'rating' };
    const sortBy = sortFields[query.sortBy ?? ''] ?? 'createdAt';
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    const [totalCount, reviews] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy: [{ [sortBy]: sortDir }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = reviews.map((r) => this.toDto(r));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
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
