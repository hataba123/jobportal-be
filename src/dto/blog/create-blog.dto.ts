// DTO dùng để tạo mới blog
import {
  IsString,
  MaxLength,
  IsArray,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateBlogDto {
  // Tiêu đề
  @IsString()
  @MaxLength(200)
  title: string = '';

  // Tóm tắt
  @IsString()
  @MaxLength(500)
  excerpt: string = '';

  // Nội dung
  @IsString()
  content: string = '';

  // Slug
  @IsString()
  @MaxLength(100)
  slug?: string;

  // Danh mục
  @IsString()
  @MaxLength(50)
  category: string = '';

  // Tags
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  // Thời gian đọc
  @IsString()
  @MaxLength(20)
  readTime: string = '';

  // Nổi bật
  @IsBoolean()
  featured: boolean = false;

  // Ảnh đại diện
  @IsString()
  @MaxLength(500)
  image: string = '';

  // Id tác giả
  @IsInt()
  authorId: number;
}
