// DTO đại diện cho bài đăng việc làm (public)
import { IsUUID, IsString, IsNumber, IsArray, IsDateString } from 'class-validator';

export class JobPostDto {
  // Id bài đăng
  @IsUUID()
  id: string;

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

  // Ngày tạo
  @IsDateString()
  createdAt: string;

  // Tên danh mục
  @IsString()
  categoryName: string;

  // Tên công ty
  @IsString()
  companyName: string;
}
