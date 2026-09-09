import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class MatchQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize = 20;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  minScore = 0;
}

export class MatchBreakdownDto {
  skills: number;
  experience: number;
  education: number;
  preferences: number;
}

export class MatchResultDto {
  jobPostId: string;
  candidateId?: string;
  totalScore: number;
  algorithmVersion: string;
  breakdown: MatchBreakdownDto;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
  inputFingerprint?: string;
  jobPost?: {
    id: string;
    title: string;
    location: string | null;
    salary: number;
    type: string | null;
    expiresAt: Date | null;
  };
  candidate?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class PagedMatchesDto {
  items: MatchResultDto[];
  page: number;
  pageSize: number;
  total: number;
}
