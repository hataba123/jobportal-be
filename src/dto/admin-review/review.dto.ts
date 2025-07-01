// DTO đại diện cho đánh giá công ty
import { IsUUID, IsInt, IsString, IsDateString } from 'class-validator';

export class ReviewDto {
  // Id đánh giá
  @IsUUID()
  id: string;

  // Id người dùng
  @IsUUID()
  userId: string;

  // Id công ty
  @IsUUID()
  companyId: string;

  // Điểm đánh giá
  @IsInt()
  rating: number;

  // Bình luận
  @IsString()
  comment: string;

  // Ngày tạo đánh giá
  @IsDateString()
  createdAt: string;
}
