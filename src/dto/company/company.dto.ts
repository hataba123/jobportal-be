// DTO đại diện cho thông tin công ty (public)
import { IsUUID, IsString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CompanyDto {
  // Id của công ty
  @IsUUID()
  id: string;

  // Tên công ty
  @IsString()
  name: string;

  // Logo công ty (URL)
  @IsOptional()
  @IsString()
  logo?: string;

  // Mô tả công ty
  @IsOptional()
  @IsString()
  description?: string;

  // Địa điểm công ty
  @IsOptional()
  @IsString()
  location?: string;

  // Quy mô nhân sự
  @IsOptional()
  @IsString()
  employees?: string;

  // Ngành nghề
  @IsOptional()
  @IsString()
  industry?: string;

  // Số lượng việc làm đang tuyển
  @IsInt()
  openJobs: number;

  // Đánh giá công ty
  @IsNumber()
  rating: number;

  // Website công ty
  @IsOptional()
  @IsString()
  website?: string;

  // Năm thành lập
  @IsOptional()
  @IsString()
  founded?: string;

  // Tags liên quan
  @IsOptional()
  @IsString()
  tags?: string;
}
