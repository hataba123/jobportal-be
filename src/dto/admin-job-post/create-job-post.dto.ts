// DTO dùng để tạo mới bài đăng việc làm
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateJobPostDto {
  // Tiêu đề bài đăng
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  // Mô tả công việc
  @IsString()
  @IsNotEmpty()
  description: string;

  // Kỹ năng yêu cầu
  @IsString()
  @IsOptional()
  @MaxLength(500)
  skillsRequired?: string;

  // Địa điểm làm việc
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  // Mức lương
  @IsNumber()
  @Min(0)
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
  @MaxLength(300)
  logo?: string;

  // Loại hình công việc
  @IsString()
  @IsOptional()
  @MaxLength(50)
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
