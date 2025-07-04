// DTO cho recruiter thao tác công ty
import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

// DTO trả về thông tin công ty
// DTO trả về thông tin công ty cho recruiter
export class RecruiterCompanyDto {
  @IsUUID()
  id: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  employees?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @IsInt()
  openJobs: number;

  @IsNumber()
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  founded?: string;

  // Trả về tags là mảng string cho FE
  tags?: string[];
}

// DTO cập nhật công ty
export class RecruiterUpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }) =>
    value !== undefined && value !== null ? String(value).slice(0, 50) : value,
  )
  employees?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @IsInt()
  @IsOptional()
  openJobs?: number;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Transform(({ value }) =>
    value !== undefined && value !== null ? String(value).slice(0, 10) : value,
  )
  founded?: string;

  // Cho phép FE gửi tags là string hoặc string[]
  @IsOptional()
  tags?: string | string[];
}
