// DTO dùng để cập nhật bài đăng việc làm
import {
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsUUID,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';

export class UpdateJobPostDto {
  // Tiêu đề bài đăng
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  // Mô tả công việc
  @IsOptional()
  @IsString()
  description?: string;

  // Kỹ năng yêu cầu
  @IsOptional()
  @IsString()
  @MaxLength(500)
  skillsRequired?: string;

  // Địa điểm làm việc
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  // Mức lương
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  // Id nhà tuyển dụng
  @IsOptional()
  @IsUUID()
  employerId?: string;

  // Id công ty (có thể null)
  @IsOptional()
  @IsUUID()
  companyId?: string;

  // Logo công ty
  @IsOptional()
  @IsString()
  @MaxLength(300)
  logo?: string;

  // Loại hình công việc
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  // Tags liên quan
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // Số lượng ứng viên
  @IsOptional()
  @IsInt()
  applicants?: number;

  // Ngày tạo bài đăng
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  // Id danh mục
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
