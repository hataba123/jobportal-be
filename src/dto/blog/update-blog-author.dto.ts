// DTO dùng để cập nhật tác giả blog
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBlogAuthorDto {
  // Tên tác giả
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  // Ảnh đại diện
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  // Vai trò
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}
