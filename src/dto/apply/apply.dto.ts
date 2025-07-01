// DTO đại diện cho đơn ứng tuyển
import { IsUUID, IsString, IsDateString } from 'class-validator';

export class ApplyDto {
  // Id đơn ứng tuyển
  @IsUUID()
  id: string;

  // Id ứng viên
  @IsUUID()
  candidateId: string;

  // Tên ứng viên
  @IsString()
  candidateName: string;

  // Id bài đăng việc làm
  @IsUUID()
  jobPostId: string;

  // Tiêu đề công việc
  @IsString()
  jobTitle: string;

  // Đường dẫn CV
  @IsString()
  cvUrl: string;

  // Trạng thái
  @IsString()
  status: string;

  // Ngày ứng tuyển
  @IsDateString()
  appliedAt: string;
}
