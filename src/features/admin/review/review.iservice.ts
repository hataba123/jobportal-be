// Interface service cho review (admin)
import { ReviewDto, UpdateReviewDto } from './review.dto';

export interface IReviewService {
  getAllReviews(): Promise<ReviewDto[]>;
  getReviewById(id: string): Promise<ReviewDto | null>;
  updateReview(id: string, dto: UpdateReviewDto): Promise<boolean>;
  deleteReview(id: string): Promise<boolean>;
}
