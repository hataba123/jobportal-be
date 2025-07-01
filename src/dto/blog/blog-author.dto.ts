// DTO đại diện cho tác giả blog
import { IsInt, IsString } from 'class-validator';

export class BlogAuthorDto {
  // Id tác giả
  @IsInt()
  id: number;

  // Tên tác giả
  @IsString()
  name: string = '';

  // Ảnh đại diện
  @IsString()
  avatar: string = '';

  // Vai trò
  @IsString()
  role: string = '';
}
