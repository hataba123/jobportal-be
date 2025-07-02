import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { ApplyStatus } from '@prisma/client';

// DTO tạo mới ứng tuyển việc làm
export class JobApplicationRequest {
  @IsUUID()
  jobPostId: string;

  @IsString()
  @IsOptional()
  cvUrl?: string;
}

// DTO cập nhật trạng thái ứng tuyển
export class UpdateApplyStatusRequest {
  @IsString()
  status: string;
}

// DTO trả về cho admin/recruiter
export class ApplyDto {
  @IsUUID()
  id: string;
  @IsUUID()
  candidateId: string;
  @IsString()
  candidateName: string;
  @IsUUID()
  jobPostId: string;
  @IsString()
  jobTitle: string;
  @IsString()
  cvUrl: string;
  @IsEnum(ApplyStatus)
  status: ApplyStatus | string;
  @IsDateString()
  appliedAt: Date;
}

// DTO trả về danh sách ứng viên ứng tuyển vào job
export class CandidateApplicationDto {
  @IsUUID()
  id: string;
  @IsUUID()
  candidateId: string;
  @IsString()
  fullName: string;
  @IsString()
  email: string;
  @IsDateString()
  appliedAt: Date;
  @IsString()
  @IsOptional()
  cvUrl?: string;
  @IsEnum(ApplyStatus)
  status: ApplyStatus | string;
}

// DTO trả về danh sách job đã ứng tuyển
export class JobAppliedDto {
  @IsUUID()
  id: string;
  @IsUUID()
  jobPostId: string;
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  skillsRequired: string;
  @IsString()
  location: string;
  @IsNumber()
  salary: number;
  @IsDateString()
  appliedAt: Date;
  @IsEnum(ApplyStatus)
  status: ApplyStatus | string;
}
