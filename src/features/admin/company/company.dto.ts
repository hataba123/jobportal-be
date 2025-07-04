import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  MaxLength,
} from 'class-validator';

// DTO trả về thông tin công ty
export class CompanyDto {
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
  // Trả về tags là mảng string cho FE dễ xử lý
  tags?: string[];
}

// DTO tạo mới công ty
export class CreateCompanyDto {
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
// DTO cập nhật công ty, không cho phép FE gửi lên trường id
export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  // Không cho phép FE gửi lên trường id khi update
  // Nếu FE gửi lên sẽ bị ValidationPipe loại bỏ hoặc báo lỗi
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
  // Cho phép tags là string hoặc string[] để FE gửi lên dạng mảng đều hợp lệ
  @IsOptional()
  tags?: string | string[];
}
