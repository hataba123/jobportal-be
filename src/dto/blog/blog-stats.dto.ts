// DTO thống kê blog
import { IsInt } from 'class-validator';

export class BlogStatsDto {
  // Tổng số blog
  @IsInt()
  totalBlogs: number;

  // Tổng số tác giả
  @IsInt()
  totalAuthors: number;

  // Tổng số lượt xem
  @IsInt()
  totalViews: number;

  // Tổng số lượt thích
  @IsInt()
  totalLikes: number;
}
