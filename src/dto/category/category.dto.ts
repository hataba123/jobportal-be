// DTO đại diện cho danh mục
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CategoryDto {
  // Id danh mục
  @IsUUID()
  id: string;

  // Tên danh mục
  @IsString()
  name: string = '';

  // Icon danh mục
  @IsOptional()
  @IsString()
  icon?: string;

  // Màu sắc danh mục
  @IsOptional()
  @IsString()
  color?: string;
}
