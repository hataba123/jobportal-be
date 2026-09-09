import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

const parseNumber = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
};

export class CreateJobPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  skillsRequired?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsUUID()
  categoryId: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @Transform(parseNumber)
  @IsNumber()
  salary: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
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
  @MaxLength(100)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  skillsRequired?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  logo?: string;

  @Transform(parseNumber)
  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
