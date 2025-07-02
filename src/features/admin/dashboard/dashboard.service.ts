// Service xử lý logic thống kê dashboard cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardDto } from './dashboard.dto';
import { IDashboardService } from './dashboard.iservice';

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy thống kê dashboard
  async getDashboardStats(): Promise<DashboardDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalCompanies,
      totalJobPosts,
      totalReviews,
      totalApplications,
      applicationsToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      this.prisma.company.count(),
      this.prisma.jobPost.count(),
      this.prisma.review.count(),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { appliedAt: { gte: today } } }),
    ]);

    return {
      totalUsers,
      newUsersToday,
      totalCompanies,
      totalJobPosts,
      totalReviews,
      totalApplications,
      applicationsToday,
      pendingReviews: 0, // Nếu có logic review chờ duyệt thì bổ sung sau
    };
  }
}
