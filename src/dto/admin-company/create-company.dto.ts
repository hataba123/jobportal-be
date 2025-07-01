// DTO dùng để tạo mới công ty
import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateCompanyDto {
  // Tên công ty
  @IsString()
  @MaxLength(200)
  name: string;

  // Logo công ty (URL)
  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  // Mô tả công ty
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  // Địa điểm công ty
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  // Quy mô nhân sự
  @IsString()
  @IsOptional()
  @MaxLength(50)
  employees?: string;

  // Ngành nghề
  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  // Số lượng việc làm đang tuyển
  @IsInt()
  openJobs: number;

  // Đánh giá công ty
  @IsNumber()
  rating: number;

  // Website công ty
  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  // Năm thành lập
  @IsString()
  @IsOptional()
  @MaxLength(10)
  founded?: string;

  // Tags liên quan
  @IsString()
  @IsOptional()
  @MaxLength(500)
  tags?: string;
}
