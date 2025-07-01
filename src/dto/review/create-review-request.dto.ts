// DTO dùng để tạo mới đánh giá công ty (public)
import { IsUUID, IsInt, IsString } from 'class-validator';

export class CreateReviewRequest {
  // Id công ty
  @IsUUID()
  companyId: string;

  // Điểm đánh giá
  @IsInt()
  rating: number;

  // Bình luận
  @IsString()
  comment: string = '';
}
