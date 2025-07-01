// DTO tìm kiếm ứng viên
import { IsOptional, IsString, IsInt } from 'class-validator';

export class CandidateSearchRequest {
  // Từ khóa
  @IsOptional()
  @IsString()
  keyword?: string;

  // Kỹ năng
  @IsOptional()
  @IsString()
  skill?: string;

  // Học vấn
  @IsOptional()
  @IsString()
  education?: string;

  // Số năm kinh nghiệm tối thiểu
  @IsOptional()
  @IsInt()
  minYearsExperience?: number;
}
