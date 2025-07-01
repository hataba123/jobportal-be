// DTO thống kê dashboard cho admin
import { IsInt } from 'class-validator';

export class DashboardDto {
  // Tổng số người dùng
  @IsInt()
  totalUsers: number;

  // Tổng số công ty
  @IsInt()
  totalCompanies: number;

  // Tổng số bài đăng việc làm
  @IsInt()
  totalJobPosts: number;

  // Tổng số đánh giá
  @IsInt()
  totalReviews: number;

  // Số đánh giá đang chờ duyệt
  @IsInt()
  pendingReviews: number;

  // Tổng số đơn ứng tuyển
  @IsInt()
  totalApplications: number;

  // Số đơn ứng tuyển hôm nay
  @IsInt()
  applicationsToday: number;

  // Số người dùng mới hôm nay
  @IsInt()
  newUsersToday: number;
}
