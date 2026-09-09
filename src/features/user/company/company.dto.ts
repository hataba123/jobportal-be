// DTO cho công ty
import { IsUUID, IsString, IsOptional, IsInt, IsNumber, IsEnum } from 'class-validator';
import { CompanyVerificationStatus } from '@prisma/client';

export class CompanyDto {
  @IsUUID()
  id: string;
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  logo?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  location?: string;
  @IsString()
  @IsOptional()
  employees?: string;
  @IsString()
  @IsOptional()
  industry?: string;
  @IsInt()
  openJobs: number;
  @IsNumber()
  rating: number;
  @IsString()
  @IsOptional()
  website?: string;
  @IsString()
  @IsOptional()
  founded?: string;
  @IsString()
  @IsOptional()
  tags?: string;
  @IsEnum(CompanyVerificationStatus)
  verificationStatus: CompanyVerificationStatus;
  verifiedAt?: Date;
}
