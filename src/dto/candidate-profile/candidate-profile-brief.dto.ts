// DTO thông tin ngắn gọn hồ sơ ứng viên
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CandidateProfileBriefDto {
  // Id hồ sơ
  @IsUUID()
  id: string;

  // Id người dùng
  @IsUUID()
  userId: string;

  // Họ tên
  @IsString()
  fullName: string;

  // Kỹ năng
  @IsOptional()
  @IsString()
  skills?: string;

  // Kinh nghiệm
  @IsOptional()
  @IsString()
  experience?: string;

  // Học vấn
  @IsOptional()
  @IsString()
  education?: string;
}
