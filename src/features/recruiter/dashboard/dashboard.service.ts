// Service xử lý dashboard recruiter
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RecruiterDashboardDto,
  JobPostSummaryDto,
  CandidateApplyDto,
} from './dashboard.dto';
import { IRecruiterDashboardService } from './dashboard.iservice';

@Injectable()
export class RecruiterDashboardService implements IRecruiterDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy dữ liệu dashboard cho recruiter
  async getDashboard(recruiterId: string): Promise<RecruiterDashboardDto> {
    // Lấy danh sách jobPost và số lượng applicant cho từng jobPost
    const jobPosts = await this.prisma.jobPost.findMany({
      where: { employerId: recruiterId },
      orderBy: { createdAt: 'desc' },
    });

    // Đếm tổng số applicant cho tất cả jobPost
    const totalApplicants = await this.prisma.job.count({
      where: { jobPostId: { in: jobPosts.map((j) => j.id) } },
    });

    // Lấy số lượng applicant cho từng jobPost
    const applicantCounts = await this.prisma.job.groupBy({
      by: ['jobPostId'],
      where: { jobPostId: { in: jobPosts.map((j) => j.id) } },
      _count: { jobPostId: true },
    });
    const applicantCountMap = new Map<string, number>();
    applicantCounts.forEach((item) => {
      applicantCountMap.set(item.jobPostId, item._count.jobPostId);
    });

    const recentJobPosts: JobPostSummaryDto[] = jobPosts
      .slice(0, 5)
      .map((j) => ({
        id: j.id,
        title: j.title,
        createdAt: j.createdAt,
        applicants: applicantCountMap.get(j.id) || 0,
      }));

    // Lấy 5 applicant gần nhất
    const recentApplicants = await this.prisma.job.findMany({
      where: { jobPostId: { in: jobPosts.map((j) => j.id) } },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: {
        candidate: true,
        jobPost: true,
      },
    });
    const recentApplicantsDto: CandidateApplyDto[] = recentApplicants.map(
      (a) => ({
        candidateId: a.candidateId,
        fullName: a.candidate?.fullName,
        email: a.candidate?.email,
        jobTitle: a.jobPost?.title,
        appliedAt: a.appliedAt,
      }),
    );
    return {
      totalJobPosts: jobPosts.length,
      totalApplicants,
      recentJobPosts,
      recentApplicants: recentApplicantsDto,
    };
  }
}
