// DTO đại diện cho bài viết blog
import {
  IsInt,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { BlogAuthorDto } from './blog-author.dto';

export class BlogDto {
  // Id bài viết
  @IsInt()
  id: number;

  // Tiêu đề
  @IsString()
  title: string = '';

  // Tóm tắt
  @IsString()
  excerpt: string = '';

  // Nội dung
  @IsString()
  content: string = '';

  // Slug
  @IsOptional()
  @IsString()
  slug?: string;

  // Danh mục
  @IsString()
  category: string = '';

  // Tags
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  // Ngày đăng
  @IsDateString()
  publishedAt: string;

  // Thời gian đọc
  @IsString()
  readTime: string = '';

  // Lượt xem
  @IsInt()
  views: number;

  // Lượt thích
  @IsInt()
  likes: number;

  // Nổi bật
  @IsBoolean()
  featured: boolean;

  // Ảnh đại diện
  @IsString()
  image: string = '';

  // Ngày tạo
  @IsDateString()
  createdAt: string;

  // Ngày cập nhật
  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  // Tác giả
  @ValidateNested()
  author: BlogAuthorDto;
}
