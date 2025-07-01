// DTO dùng để cập nhật hồ sơ ứng viên
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CandidateProfileUpdateDto {
  // Họ tên
  @IsOptional()
  @IsString()
  fullName?: string;

  // Email
  @IsOptional()
  @IsString()
  email?: string;

  // Đường dẫn CV
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  // Kinh nghiệm
  @IsOptional()
  @IsString()
  experience?: string;

  // Kỹ năng
  @IsOptional()
  @IsString()
  skills?: string;

  // Học vấn
  @IsOptional()
  @IsString()
  education?: string;

  // Ngày sinh
  @IsOptional()
  @IsDateString()
  dob?: string;

  // Giới tính
  @IsOptional()
  @IsString()
  gender?: string;

  // Portfolio
  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  // Linkedin
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  // Github
  @IsOptional()
  @IsString()
  githubUrl?: string;

  // Chứng chỉ
  @IsOptional()
  @IsString()
  certificates?: string;

  // Tóm tắt
  @IsOptional()
  @IsString()
  summary?: string;
}
