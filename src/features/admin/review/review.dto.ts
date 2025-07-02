// DTO cho review (admin)
import {
  IsUUID,
  IsInt,
  IsString,
  IsDate,
  IsOptional,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class ReviewDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  companyId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(1000)
  comment: string;

  @IsDate()
  createdAt: Date;
}

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  comment?: string;
}
