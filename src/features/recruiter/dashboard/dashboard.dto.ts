// DTO cho dashboard recruiter
import {
  IsInt,
  IsArray,
  ValidateNested,
  IsUUID,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
// DTO tóm tắt job post cho dashboard recruiter
export class JobPostSummaryDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsDate()
  createdAt: Date;

  @IsInt()
  applicants: number;
}

// DTO ứng viên apply gần đây cho dashboard recruiter
export class CandidateApplyDto {
  @IsUUID()
  candidateId: string;

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  jobTitle: string;

  @IsDate()
  appliedAt: Date;
}

// DTO tổng quan dashboard recruiter
export class RecruiterDashboardDto {
  @IsInt()
  totalJobPosts: number;

  @IsInt()
  totalApplicants: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobPostSummaryDto)
  recentJobPosts: JobPostSummaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateApplyDto)
  recentApplicants: CandidateApplyDto[];
}
