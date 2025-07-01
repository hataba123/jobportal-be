// DTO trả về danh sách blog và phân trang
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { BlogDto } from './blog.dto';

export class BlogResponseDto {
  // Danh sách blog
  @IsArray()
  @ValidateNested({ each: true })
  blogs: BlogDto[] = [];

  // Tổng số blog
  @IsInt()
  total: number;

  // Trang hiện tại
  @IsInt()
  page: number;

  // Số lượng mỗi trang
  @IsInt()
  limit: number;

  // Tổng số trang
  @IsInt()
  totalPages: number;
}
