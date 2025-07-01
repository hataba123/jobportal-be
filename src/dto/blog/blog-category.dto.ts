// DTO đại diện cho danh mục blog
import { IsInt, IsString, IsOptional } from 'class-validator';

export class BlogCategoryDto {
  // Id danh mục
  @IsInt()
  id: number;

  // Tên danh mục
  @IsString()
  name: string = '';

  // Mô tả danh mục
  @IsOptional()
  @IsString()
  description?: string;

  // Số lượng bài viết
  @IsInt()
  count: number;
}
