// DTO dashboard cho recruiter
import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { JobPostSummaryDto } from './job-post-summary.dto';
import { CandidateApplyDto } from './candidate-apply.dto';

export class RecruiterDashboardDto {
  // Tổng số bài đăng
  @IsInt()
  totalJobPosts: number;

  // Tổng số ứng viên
  @IsInt()
  totalApplicants: number;

  // Danh sách bài đăng gần đây
  @IsArray()
  @ValidateNested({ each: true })
  recentJobPosts: JobPostSummaryDto[];

  // Danh sách ứng viên gần đây
  @IsArray()
  @ValidateNested({ each: true })
  recentApplicants: CandidateApplyDto[];
}
