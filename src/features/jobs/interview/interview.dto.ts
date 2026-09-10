import { InterviewResult, InterviewStatus, InterviewType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateInterviewDto {
  @IsEnum(InterviewType) type: InterviewType;
  @IsDateString() startAt: string;
  @IsDateString() endAt: string;
  @IsOptional() @IsString() @MaxLength(500) location?: string;
  @IsOptional() @IsString() @MaxLength(500) meetingUrl?: string;
  @IsOptional() @IsString() @MaxLength(4000) notes?: string;
}

export class UpdateInterviewDto {
  @IsOptional() @IsEnum(InterviewType) type?: InterviewType;
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsString() @MaxLength(500) location?: string;
  @IsOptional() @IsString() @MaxLength(500) meetingUrl?: string;
  @IsOptional() @IsString() @MaxLength(4000) notes?: string;
}

export class CompleteInterviewDto {
  @IsEnum(InterviewResult) result: InterviewResult;
  @IsOptional() @IsString() @MaxLength(4000) notes?: string;
  @IsOptional() @IsString() applicationVersion?: string;
}

export class InterviewQueryDto {
  @IsOptional() @IsUUID() applicationId?: string;
  @IsOptional() @IsEnum(InterviewStatus) status?: InterviewStatus;
  @IsOptional() @IsEnum(InterviewType) type?: InterviewType;
  @IsOptional() page?: number = 1;
  @IsOptional() pageSize?: number = 20;
}
