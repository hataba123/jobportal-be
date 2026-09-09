import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  calculateMatch,
  CandidateMatchInput,
  JobMatchInput,
} from './matching.engine';
import {
  MatchQueryDto,
  MatchResultDto,
  PagedMatchesDto,
} from './matching.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendedJobs(
    candidateId: string,
    query: MatchQueryDto,
  ): Promise<PagedMatchesDto> {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
    });
    if (!profile) throw new NotFoundException('Hồ sơ ứng viên chưa tồn tại.');

    const jobs = await this.prisma.jobPost.findMany({
      where: {
        deletedAt: null,
        status: 'Active',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
    const scored = await Promise.all(
      jobs.map(async (job) => {
        const result = calculateMatch(this.toCandidateInput(profile), this.toJobInput(job));
        await this.saveResult(result);
        return this.withJob(result, job);
      }),
    );
    const filtered = scored
      .filter((item) => item.totalScore >= query.minScore)
      .sort((a, b) => b.totalScore - a.totalScore);
    const start = (query.page - 1) * query.pageSize;
    return {
      items: filtered.slice(start, start + query.pageSize),
      page: query.page,
      pageSize: query.pageSize,
      total: filtered.length,
    };
  }

  async rankCandidates(
    actorId: string,
    jobPostId: string,
    isAdmin: boolean,
    query: MatchQueryDto,
  ): Promise<PagedMatchesDto> {
    const job = await this.prisma.jobPost.findFirst({
      where: { id: jobPostId, deletedAt: null },
    });
    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng.');
    if (!isAdmin && job.employerId !== actorId) {
      throw new ForbiddenException('Bạn không có quyền xem xếp hạng tin này.');
    }

    const applications = await this.prisma.job.findMany({
      where: { jobPostId },
      include: { candidate: { include: { candidateProfile: true } } },
    });
    const scored: MatchResultDto[] = [];
    for (const application of applications) {
      if (!application.candidate.candidateProfile) continue;
      const result = calculateMatch(
        this.toCandidateInput(application.candidate.candidateProfile),
        this.toJobInput(job),
      );
      await this.saveResult(result);
      scored.push({
        ...result,
        candidate: {
          id: application.candidate.id,
          fullName: application.candidate.fullName,
          email: application.candidate.email,
        },
      });
    }
    const filtered = scored
      .filter((item) => item.totalScore >= query.minScore)
      .sort((a, b) => b.totalScore - a.totalScore);
    const start = (query.page - 1) * query.pageSize;
    return {
      items: filtered.slice(start, start + query.pageSize),
      page: query.page,
      pageSize: query.pageSize,
      total: filtered.length,
    };
  }

  async getCandidateMatch(
    actorId: string,
    jobPostId: string,
    candidateId: string,
    isAdmin: boolean,
  ): Promise<MatchResultDto> {
    const job = await this.prisma.jobPost.findFirst({
      where: { id: jobPostId, deletedAt: null },
    });
    if (!job) throw new NotFoundException('Không tìm thấy tin tuyển dụng.');
    if (!isAdmin && job.employerId !== actorId) {
      throw new ForbiddenException('Bạn không có quyền xem xếp hạng tin này.');
    }
    const application = await this.prisma.job.findUnique({
      where: { candidateId_jobPostId: { candidateId, jobPostId } },
      include: { candidate: { include: { candidateProfile: true } } },
    });
    if (!application || !application.candidate.candidateProfile) {
      throw new NotFoundException('Ứng viên chưa ứng tuyển hoặc chưa có hồ sơ.');
    }
    const result = calculateMatch(
      this.toCandidateInput(application.candidate.candidateProfile),
      this.toJobInput(job),
    );
    await this.saveResult(result);
    return {
      ...result,
      candidate: {
        id: application.candidate.id,
        fullName: application.candidate.fullName,
        email: application.candidate.email,
      },
    };
  }

  private async saveResult(result: ReturnType<typeof calculateMatch>): Promise<void> {
    await this.prisma.matchResult.upsert({
      where: { candidateId_jobPostId: {
        candidateId: result.candidateId,
        jobPostId: result.jobPostId,
      } },
      create: {
        candidateId: result.candidateId,
        jobPostId: result.jobPostId,
        totalScore: result.totalScore,
        breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        reasons: [result.reason],
        algorithmVersion: result.algorithmVersion,
        inputFingerprint: result.inputFingerprint,
      },
      update: {
        totalScore: result.totalScore,
        breakdown: result.breakdown as unknown as Prisma.InputJsonValue,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        reasons: [result.reason],
        algorithmVersion: result.algorithmVersion,
        inputFingerprint: result.inputFingerprint,
        createdAt: new Date(),
      },
    });
  }

  private toCandidateInput(profile: {
    userId: string;
    skills: string | null;
    certificates: string | null;
    experience: string | null;
    experienceYears: number | null;
    education: string | null;
    preferredLocation: string | null;
    preferredJobType: string | null;
    expectedSalary: unknown;
  }): CandidateMatchInput {
    return {
      id: profile.userId,
      skills: profile.skills,
      certificates: profile.certificates,
      experience: profile.experience,
      experienceYears: profile.experienceYears,
      education: profile.education,
      preferredLocation: profile.preferredLocation,
      preferredJobType: profile.preferredJobType,
      expectedSalary: profile.expectedSalary == null ? null : Number(profile.expectedSalary),
    };
  }

  private toJobInput(job: {
    id: string;
    skillsRequired: string | null;
    tags: string | null;
    description: string;
    location: string | null;
    type: string | null;
    salary: unknown;
    minExperienceYears: number | null;
    educationRequirement: string | null;
  }): JobMatchInput {
    return {
      id: job.id,
      skillsRequired: job.skillsRequired,
      tags: job.tags,
      description: job.description,
      location: job.location,
      type: job.type,
      salary: Number(job.salary),
      minExperienceYears: job.minExperienceYears,
      educationRequirement: job.educationRequirement,
    };
  }

  private withJob(result: ReturnType<typeof calculateMatch>, job: {
    id: string;
    title: string;
    location: string | null;
    salary: unknown;
    type: string | null;
    expiresAt: Date | null;
  }): MatchResultDto {
    return {
      ...result,
      jobPost: {
        id: job.id,
        title: job.title,
        location: job.location,
        salary: Number(job.salary),
        type: job.type,
        expiresAt: job.expiresAt,
      },
    };
  }
}
