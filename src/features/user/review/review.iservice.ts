import { ReviewDto, CreateReviewRequest } from './review.dto';

// Interface service cho review (user)
export interface IReviewService {
  getByCompanyAsync(companyId: string): Promise<ReviewDto[]>;
  createAsync(userId: string, request: CreateReviewRequest): Promise<void>;
  getAllAsync(): Promise<ReviewDto[]>;
}
