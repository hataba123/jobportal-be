// DTO tìm kiếm blog
import { IsOptional, IsString, IsInt } from 'class-validator';

export class BlogSearchDto {
  // Từ khóa tìm kiếm
  @IsOptional()
  @IsString()
  search?: string;

  // Danh mục
  @IsOptional()
  @IsString()
  category?: string;

  // Sắp xếp
  @IsOptional()
  @IsString()
  sort?: string;

  // Trang hiện tại
  @IsInt()
  page: number = 1;

  // Số lượng mỗi trang
  @IsInt()
  limit: number = 10;
}
