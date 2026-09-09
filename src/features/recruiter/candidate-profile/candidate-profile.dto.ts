// DTO cho Candidate Profile (ứng viên)
import {
  IsUUID,
  IsString,
  IsOptional,
  IsDate,
  MaxLength,
  IsDateString,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';
import { ApplyStatus } from '@prisma/client';

export class CandidateProfileBriefDto {
  @IsUUID()
  id: string;
  @IsUUID()
  userId: string;
  @IsString()
  fullName: string;
  @IsString()
  @IsOptional()
  skills?: string;
  @IsString()
  @IsOptional()
  experience?: string;
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceYears?: number;
  @IsString()
  @IsOptional()
  education?: string;
  @IsString()
  @IsOptional()
  preferredLocation?: string;
  @IsString()
  @IsOptional()
  preferredJobType?: string;
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;
}

export class CandidateProfileDetailDto {
  @IsUUID()
  id: string;
  @IsUUID()
  userId: string;
  @IsString()
  fullName: string;
  @IsString()
  @IsOptional()
  resumeUrl?: string;
  @IsString()
  @IsOptional()
  experience?: string;
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceYears?: number;
  @IsString()
  @IsOptional()
  skills?: string;
  @IsString()
  @IsOptional()
  education?: string;
  @IsString()
  @IsOptional()
  preferredLocation?: string;
  @IsString()
  @IsOptional()
  preferredJobType?: string;
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;
  // Nhận ngày sinh dạng string ISO ("1991-12-04") từ FE
  @IsDateString()
  @IsOptional()
  dob?: string;
  @IsString()
  @IsOptional()
  gender?: string;
  @IsString()
  @IsOptional()
  portfolioUrl?: string;
  @IsString()
  @IsOptional()
  linkedinUrl?: string;
  @IsString()
  @IsOptional()
  githubUrl?: string;
  @IsString()
  @IsOptional()
  certificates?: string;
  @IsString()
  @IsOptional()
  summary?: string;
  @IsString()
  email: string;
}

export class CandidateProfileUpdateDto {
  @IsString()
  @IsOptional()
  fullName?: string;
  @IsString()
  @IsOptional()
  email?: string;
  @IsString()
  @IsOptional()
  experience?: string;
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceYears?: number;
  @IsString()
  @IsOptional()
  skills?: string;
  @IsString()
  @IsOptional()
  education?: string;
  @IsString()
  @IsOptional()
  preferredLocation?: string;
  @IsString()
  @IsOptional()
  preferredJobType?: string;
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;
  // Nhận ngày sinh dạng string ISO ("1991-12-04") từ FE
  @IsDateString()
  @IsOptional()
  dob?: string;
  @IsString()
  @IsOptional()
  gender?: string;
  @IsString()
  @IsOptional()
  portfolioUrl?: string;
  @IsString()
  @IsOptional()
  linkedinUrl?: string;
  @IsString()
  @IsOptional()
  githubUrl?: string;
  @IsString()
  @IsOptional()
  certificates?: string;
  @IsString()
  @IsOptional()
  summary?: string;
}

export class CandidateApplicationDto {
  @IsUUID()
  jobId: string;
  @IsUUID()
  jobPostId: string;
  @IsString()
  jobTitle: string;
  @IsDate()
  appliedAt: Date;
  @IsString()
  cvUrl: string;
  @IsString()
  status: ApplyStatus;
}

export class CandidateSearchRequest {
  @IsString()
  @IsOptional()
  keyword?: string;
  @IsString()
  @IsOptional()
  skill?: string;
  @IsString()
  @IsOptional()
  education?: string;
  @IsOptional()
  minYearsExperience?: number;
}
