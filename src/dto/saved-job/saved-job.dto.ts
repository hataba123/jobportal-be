// DTO đại diện cho công việc đã lưu
import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class SavedJobDto {
  // Id công việc đã lưu
  @IsUUID()
  id: string;

  // Id bài đăng công việc
  @IsUUID()
  jobPostId: string;

  // Tiêu đề công việc
  @IsString()
  title: string = '';

  // Địa điểm (có thể null)
  @IsOptional()
  @IsString()
  location?: string;

  // Ngày lưu
  @IsDateString()
  savedAt: string;
}
