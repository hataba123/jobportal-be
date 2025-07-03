import { IsUUID, IsInt, IsString, IsDate, IsNotEmpty } from 'class-validator';

// DTO cho review
export class ReviewDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  companyId: string;

  @IsInt()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsDate()
  createdAt: Date;
}

// DTO tạo mới review
export class CreateReviewRequest {
  @IsUUID()
  companyId: string;

  @IsInt()
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}
