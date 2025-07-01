// DTO dùng để tạo mới bài đăng việc làm (public)
import { IsString, IsNumber, IsUUID, IsArray, IsOptional } from 'class-validator';

export class CreateJobPostDto {
  // Tiêu đề bài đăng
  @IsString()
  title: string;

  // Mô tả công việc
  @IsString()
  description: string;

  // Địa điểm làm việc
  @IsString()
  location: string;

  // Mức lương
  @IsNumber()
  salary: number;

  // Loại hình công việc
  @IsString()
  type: string;

  // Logo công ty
  @IsString()
  logo: string;

  // Tags liên quan
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  // Id danh mục
  @IsUUID()
  categoryId: string;

  // Id công ty (có thể null)
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
