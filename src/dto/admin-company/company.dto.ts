// DTO đại diện cho thông tin công ty
import { IsUUID, IsString, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CompanyDto {
  // Id của công ty
  @IsUUID()
  id: string;

  // Tên công ty
  @IsString()
  name: string;

  // Logo công ty (URL)
  @IsString()
  @IsOptional()
  logo?: string;

  // Mô tả công ty
  @IsString()
  @IsOptional()
  description?: string;

  // Địa điểm công ty
  @IsString()
  @IsOptional()
  location?: string;

  // Quy mô nhân sự
  @IsString()
  @IsOptional()
  employees?: string;

  // Ngành nghề
  @IsString()
  @IsOptional()
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
  website?: string;

  // Năm thành lập
  @IsString()
  @IsOptional()
  founded?: string;

  // Tags liên quan
  @IsString()
  @IsOptional()
  tags?: string;
}
