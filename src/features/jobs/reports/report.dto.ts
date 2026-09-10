import { JobReportStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsUUID() jobPostId: string;
  @IsString() @MaxLength(200) reason: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}

export class UpdateReportDto {
  @IsEnum(JobReportStatus) status: JobReportStatus;
}

export class ReportQueryDto {
  @IsOptional() @IsEnum(JobReportStatus) status?: JobReportStatus;
  @IsOptional() @IsString() search?: string;
  @IsOptional() page?: number = 1;
  @IsOptional() pageSize?: number = 20;
}
