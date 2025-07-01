// DTO dùng để cập nhật thông tin công ty
import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateCompanyDto {
  // Tên công ty
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  // Logo công ty (URL)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  logo?: string;

  // Mô tả công ty
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // Địa điểm công ty
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  // Quy mô nhân sự
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employees?: string;

  // Ngành nghề
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  // Số lượng việc làm đang tuyển
  @IsOptional()
  @IsInt()
  openJobs?: number;

  // Đánh giá công ty
  @IsOptional()
  @IsNumber()
  rating?: number;

  // Website công ty
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  // Năm thành lập
  @IsOptional()
  @IsString()
  @MaxLength(10)
  founded?: string;

  // Tags liên quan
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;
}
