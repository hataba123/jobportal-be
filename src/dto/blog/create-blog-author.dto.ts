// DTO dùng để tạo mới tác giả blog
import { IsString, MaxLength } from 'class-validator';

export class CreateBlogAuthorDto {
  // Tên tác giả
  @IsString()
  @MaxLength(100)
  name: string = '';

  // Ảnh đại diện
  @IsString()
  @MaxLength(500)
  avatar: string = '';

  // Vai trò
  @IsString()
  @MaxLength(100)
  role: string = '';
}
