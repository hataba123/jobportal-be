// DTO cho recruiter thao tác công ty
import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  MaxLength,
} from 'class-validator';

// DTO trả về thông tin công ty
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

  @IsString()
  @IsOptional()
  @MaxLength(500)
  tags?: string;
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
  founded?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  tags?: string;
}
