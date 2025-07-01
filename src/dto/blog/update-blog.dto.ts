// DTO dùng để cập nhật blog
import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class UpdateBlogDto {
  // Tiêu đề
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  // Tóm tắt
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  // Nội dung
  @IsOptional()
  @IsString()
  content?: string;

  // Slug
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  // Danh mục
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  // Tags
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Thời gian đọc
  @IsOptional()
  @IsString()
  @MaxLength(20)
  readTime?: string;

  // Nổi bật
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  // Ảnh đại diện
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;
}
