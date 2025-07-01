// DTO đại diện cho ứng tuyển của ứng viên
import { IsUUID, IsString, IsDateString } from 'class-validator';
import { ApplyStatus } from '../apply/candidate-application.dto';

export class CandidateApplicationDto {
  // Id công việc
  @IsUUID()
  jobId: string;

  // Id bài đăng công việc
  @IsUUID()
  jobPostId: string;

  // Tiêu đề công việc
  @IsString()
  jobTitle: string;

  // Ngày ứng tuyển
  @IsDateString()
  appliedAt: string;

  // Đường dẫn CV
  @IsString()
  cvUrl: string;

  // Trạng thái
  @IsString()
  status: ApplyStatus;
}
