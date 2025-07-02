// DTO thống kê dashboard cho admin
import { IsInt } from 'class-validator';

export class DashboardDto {
  // Tổng số user
  @IsInt()
  totalUsers: number;

  // Tổng số công ty
  @IsInt()
  totalCompanies: number;

  // Tổng số job post
  @IsInt()
  totalJobPosts: number;

  // Tổng số review
  @IsInt()
  totalReviews: number;

  // Số review chờ duyệt (nếu có)
  @IsInt()
  pendingReviews?: number;

  // Tổng số đơn ứng tuyển
  @IsInt()
  totalApplications: number;

  // Số đơn ứng tuyển hôm nay
  @IsInt()
  applicationsToday: number;

  // Số user mới hôm nay
  @IsInt()
  newUsersToday: number;
}
