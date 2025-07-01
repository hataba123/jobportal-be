// DTO dùng để cập nhật đánh giá công ty
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateReviewDto {
  // Điểm đánh giá (1-5)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  // Bình luận
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
