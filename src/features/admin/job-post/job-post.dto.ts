// DTO cho job post (admin)
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  MaxLength,
  IsArray,
  IsDate,
  IsInt,
} from 'class-validator';

export class JobPostDto {
  @IsUUID()
  id: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  skillsRequired?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsNumber()
  salary: number;

  @IsUUID()
  employerId: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsInt()
  applicants: number;

  @IsDate()
  createdAt: Date;

  @IsUUID()
  categoryId: string;
}

export class CreateJobPostDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  skillsRequired?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsNumber()
  salary: number;

  @IsUUID()
  employerId: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsInt()
  applicants: number;

  @IsDate()
  createdAt: Date;

  @IsUUID()
  categoryId: string;
}

export class UpdateJobPostDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  skillsRequired?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsUUID()
  @IsOptional()
  employerId?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsInt()
  @IsOptional()
  applicants?: number;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
