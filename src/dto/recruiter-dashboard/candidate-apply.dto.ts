// DTO đại diện cho ứng viên đã ứng tuyển trong dashboard recruiter
import { IsUUID, IsString, IsDateString } from 'class-validator';

export class CandidateApplyDto {
  // Id ứng viên
  @IsUUID()
  candidateId: string;

  // Họ tên
  @IsString()
  fullName: string;

  // Email
  @IsString()
  email: string;

  // Tiêu đề công việc
  @IsString()
  jobTitle: string;

  // Ngày ứng tuyển
  @IsDateString()
  appliedAt: string;
}
