import { IsUUID, IsString, IsDate, IsOptional } from 'class-validator';

// DTO cho saved job
export class SavedJobDto {
  @IsUUID()
  id: string;

  @IsUUID()
  jobPostId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDate()
  savedAt: Date;
}
