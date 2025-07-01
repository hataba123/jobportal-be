// DTO tóm tắt bài đăng việc làm cho dashboard recruiter
import { IsUUID, IsString, IsDateString, IsInt } from 'class-validator';

export class JobPostSummaryDto {
  // Id bài đăng
  @IsUUID()
  id: string;

  // Tiêu đề bài đăng
  @IsString()
  title: string;

  // Ngày tạo
  @IsDateString()
  createdAt: string;

  // Số lượng ứng viên
  @IsInt()
  applicants: number;
}
