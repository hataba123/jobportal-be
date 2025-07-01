// DTO đại diện cho công việc đã ứng tuyển
import { IsUUID, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApplyStatus } from './candidate-application.dto';

export class JobAppliedDto {
  // Id đơn ứng tuyển
  @IsUUID()
  id: string;

  // Id bài đăng việc làm
  @IsUUID()
  jobPostId: string;

  // Tiêu đề công việc
  @IsString()
  title: string;

  // Mô tả công việc
  @IsString()
  description: string;

  // Kỹ năng yêu cầu
  @IsString()
  skillsRequired: string;

  // Địa điểm
  @IsString()
  location: string;

  // Mức lương
  @IsNumber()
  salary: number;

  // Ngày ứng tuyển
  @IsDateString()
  appliedAt: string;

  // Trạng thái
  @IsString()
  status: ApplyStatus;
}
