// DTO đại diện cho ứng viên đã ứng tuyển
import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export enum ApplyStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export class CandidateApplicationDto {
  // Id đơn ứng tuyển
  @IsUUID()
  id: string;

  // Id ứng viên
  @IsUUID()
  candidateId: string;

  // Họ tên ứng viên
  @IsString()
  fullName: string = '';

  // Email ứng viên
  @IsString()
  email: string = '';

  // Ngày ứng tuyển
  @IsDateString()
  appliedAt: string;

  // Đường dẫn CV (có thể null)
  @IsOptional()
  @IsString()
  cvUrl?: string;

  // Trạng thái
  @IsString()
  status: ApplyStatus;
}
