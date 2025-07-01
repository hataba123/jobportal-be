// DTO đại diện cho bài đăng việc làm
import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';

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

  // Kỹ năng yêu cầu
  @IsString()
  @IsOptional()
  skillsRequired?: string;

  // Địa điểm làm việc
  @IsString()
  @IsOptional()
  location?: string;

  // Mức lương
  @IsNumber()
  salary: number;

  // Id nhà tuyển dụng
  @IsUUID()
  employerId: string;

  // Id công ty (có thể null)
  @IsOptional()
  @IsUUID()
  companyId?: string;

  // Logo công ty
  @IsString()
  @IsOptional()
  logo?: string;

  // Loại hình công việc
  @IsString()
  @IsOptional()
  type?: string;

  // Tags liên quan
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  // Số lượng ứng viên
  @IsInt()
  applicants: number;

  // Ngày tạo bài đăng
  @IsDateString()
  createdAt: string;

  // Id danh mục
  @IsUUID()
  categoryId: string;
}
