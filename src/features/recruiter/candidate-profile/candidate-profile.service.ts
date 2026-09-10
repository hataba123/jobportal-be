// Service xử lý logic Candidate Profile cho recruiter/candidate
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from '../../../prisma/prisma.service';
import { FileUtil } from '../../../common/utils/file.util';
import {
  CandidateProfileBriefDto,
  CandidateProfileDetailDto,
  CandidateProfileUpdateDto,
  CandidateApplicationDto,
  CandidateSearchRequest,
} from './candidate-profile.dto';
import { IRecruiterCandidateService } from './candidate-profile.iservice';
import { PagedResult } from '../../../common/dto/pagination.dto';
import { encodeVersion } from '../../../common/concurrency/concurrency';

@Injectable()
export class RecruiterCandidateService implements IRecruiterCandidateService {
  constructor(private readonly prisma: PrismaService) {}

  // Tìm kiếm ứng viên
  // Tìm kiếm ứng viên theo keyword, skill, education, minYearsExperience
  async searchCandidates(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<CandidateProfileBriefDto[]> {
    const where: any = {};
    if (request.keyword) {
      where.fullName = { contains: request.keyword, mode: 'insensitive' };
    }
    if (request.skill) {
      where.skills = { contains: request.skill, mode: 'insensitive' };
    }
    if (request.education) {
      where.education = { contains: request.education, mode: 'insensitive' };
    }
    // minYearsExperience: giả sử lưu trong experience dạng string, có thể cần custom lại
    const profiles = await this.prisma.candidateProfile.findMany({
      where,
      include: { user: true },
    });
    return profiles.map((c) => ({
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      skills: c.skills ?? undefined,
      experience: c.experience ?? undefined,
      experienceYears: c.experienceYears ?? undefined,
      education: c.education ?? undefined,
      preferredLocation: c.preferredLocation ?? undefined,
      preferredJobType: c.preferredJobType ?? undefined,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
    }));
  }

  async searchCandidatesPaged(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<PagedResult<CandidateProfileBriefDto>> {
    // Recruiter ownership is enforced by the authenticated role and this
    // endpoint only exposes candidate profiles; no client-supplied actor id is
    // used in the query.
    void recruiterId;
    const page = Math.max(1, Number(request.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(request.pageSize) || 20));
    const keyword = request.keyword?.trim();
    const normalizedSkill = request.skill?.trim().toLowerCase();
    const where: any = {};
    if (keyword) {
      where.OR = [
        { user: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
        { skills: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (normalizedSkill) {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { candidateSkills: { some: { normalizedName: normalizedSkill } } },
            { skills: { contains: request.skill!.trim(), mode: 'insensitive' } },
          ],
        },
      ];
    }
    if (request.education?.trim()) {
      where.education = { contains: request.education.trim(), mode: 'insensitive' };
    }
    const experienceFrom = request.experienceFrom ?? request.minYearsExperience;
    if (experienceFrom !== undefined) where.experienceYears = { ...(where.experienceYears ?? {}), gte: experienceFrom };
    if (request.experienceTo !== undefined) where.experienceYears = { ...(where.experienceYears ?? {}), lte: request.experienceTo };
    if (request.location?.trim()) {
      where.preferredLocation = { contains: request.location.trim(), mode: 'insensitive' };
    }
    const sortDir = request.sortDir === 'asc' ? 'asc' : 'desc';
    const sortBy = request.sortBy;
    const orderBy: any[] = sortBy === 'experience'
      ? [{ experienceYears: sortDir }, { id: 'asc' }]
      : sortBy === 'name'
        ? [{ user: { fullName: sortDir } }, { id: 'asc' }]
        : sortBy === 'location'
          ? [{ preferredLocation: sortDir }, { id: 'asc' }]
          : [{ id: 'asc' }];
    const [totalCount, profiles] = await this.prisma.$transaction([
      this.prisma.candidateProfile.count({ where }),
      this.prisma.candidateProfile.findMany({
        where,
        include: { user: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = profiles.map((c) => ({
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      skills: c.skills ?? undefined,
      experience: c.experience ?? undefined,
      experienceYears: c.experienceYears ?? undefined,
      education: c.education ?? undefined,
      preferredLocation: c.preferredLocation ?? undefined,
      preferredJobType: c.preferredJobType ?? undefined,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
    }));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  // Lấy chi tiết ứng viên theo recruiter
  // Lấy chi tiết ứng viên theo recruiter
  async getCandidateById(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateProfileDetailDto | null> {
    const hasApplication = await this.prisma.job.findFirst({
      where: { candidateId, jobPost: { employerId: recruiterId } },
      select: { id: true },
    });
    if (!hasApplication) return null;
    const c = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: { user: true },
    });
    if (!c) return null;
    return {
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      resumeUrl: c.resumeUrl ? `/api/candidate-profile/recruiter/${candidateId}/cv` : undefined,
      experience: c.experience ?? undefined,
      skills: c.skills ?? undefined,
      education: c.education ?? undefined,
      experienceYears: c.experienceYears ?? undefined,
      preferredLocation: c.preferredLocation ?? undefined,
      preferredJobType: c.preferredJobType ?? undefined,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
      dob: c.dob
        ? c.dob instanceof Date
          ? c.dob.toISOString().slice(0, 10)
          : c.dob
        : undefined,
      gender: c.gender ?? undefined,
      portfolioUrl: c.portfolioUrl ?? undefined,
      linkedinUrl: c.linkedinUrl ?? undefined,
      githubUrl: c.githubUrl ?? undefined,
      certificates: c.certificates ?? undefined,
      summary: c.summary ?? undefined,
      email: c.user.email,
    };
  }

  // Lấy danh sách đơn ứng tuyển của ứng viên
  // Lấy danh sách đơn ứng tuyển của ứng viên
  async getCandidateApplications(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateApplicationDto[]> {
    const jobs = await this.prisma.job.findMany({
      where: {
        candidateId,
        jobPost: { employerId: recruiterId },
      },
      include: { jobPost: true },
    });
    return jobs.map((j) => ({
      jobId: j.id,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      appliedAt: j.appliedAt,
      cvUrl: j.cvUrl ? `/api/candidate-profile/recruiter/${candidateId}/cv` : '',
      status: j.status,
    }));
  }

  async getCandidateApplicationsPaged(
    recruiterId: string,
    candidateId: string,
    requestedPage: number,
    requestedPageSize: number,
  ): Promise<PagedResult<CandidateApplicationDto>> {
    const page = Math.max(1, Number(requestedPage) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(requestedPageSize) || 20));
    const where = { candidateId, jobPost: { employerId: recruiterId } };
    const [totalCount, jobs] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: { jobPost: true },
        orderBy: [{ appliedAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = jobs.map((j) => ({
      jobId: j.id,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      appliedAt: j.appliedAt,
      cvUrl: j.cvUrl ? `/api/candidate-profile/recruiter/${candidateId}/cv` : '',
      status: j.status,
      version: encodeVersion(j.version),
    }));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  // Lấy danh sách ứng viên đã ứng tuyển vào job của recruiter
  // Lấy danh sách ứng viên đã ứng tuyển vào job của recruiter
  async getCandidatesForRecruiter(
    recruiterId: string,
  ): Promise<CandidateProfileBriefDto[]> {
    const candidateIds = await this.prisma.job.findMany({
      where: {
        jobPost: { employerId: recruiterId },
      },
      select: { candidateId: true },
      distinct: ['candidateId'],
    });
    const ids = candidateIds.map((c) => c.candidateId);
    const profiles = await this.prisma.candidateProfile.findMany({
      where: { userId: { in: ids } },
      include: { user: true },
    });
    return profiles.map((c) => ({
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      skills: c.skills ?? undefined,
      experience: c.experience ?? undefined,
      experienceYears: c.experienceYears ?? undefined,
      education: c.education ?? undefined,
      preferredLocation: c.preferredLocation ?? undefined,
      preferredJobType: c.preferredJobType ?? undefined,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
    }));
  }

  async getCandidatesForRecruiterPaged(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<PagedResult<CandidateProfileBriefDto>> {
    const page = Math.max(1, Number(request.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(request.pageSize) || 20));
    const keyword = request.keyword?.trim();
    const where: any = {
      user: { jobs: { some: { jobPost: { employerId: recruiterId } } } },
    };
    if (keyword) {
      where.AND = [{ OR: [
        { user: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
        { skills: { contains: keyword, mode: 'insensitive' } },
      ] }];
    }
    if (request.skill?.trim()) {
      where.AND = [...(where.AND ?? []), { skills: { contains: request.skill.trim(), mode: 'insensitive' } }];
    }
    if (request.education?.trim()) where.education = { contains: request.education.trim(), mode: 'insensitive' };
    const experienceFrom = request.experienceFrom ?? request.minYearsExperience;
    if (experienceFrom !== undefined) where.experienceYears = { gte: experienceFrom };
    if (request.experienceTo !== undefined) where.experienceYears = { ...(where.experienceYears ?? {}), lte: request.experienceTo };
    if (request.location?.trim()) where.preferredLocation = { contains: request.location.trim(), mode: 'insensitive' };
    const sortDir = request.sortDir === 'asc' ? 'asc' : 'desc';
    const orderBy: any[] = request.sortBy === 'experience'
      ? [{ experienceYears: sortDir }, { id: 'asc' }]
      : request.sortBy === 'name'
        ? [{ user: { fullName: sortDir } }, { id: 'asc' }]
        : [{ id: 'asc' }];
    const [totalCount, profiles] = await this.prisma.$transaction([
      this.prisma.candidateProfile.count({ where }),
      this.prisma.candidateProfile.findMany({
        where,
        include: { user: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const items = profiles.map((c) => ({
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      skills: c.skills ?? undefined,
      experience: c.experience ?? undefined,
      experienceYears: c.experienceYears ?? undefined,
      education: c.education ?? undefined,
      preferredLocation: c.preferredLocation ?? undefined,
      preferredJobType: c.preferredJobType ?? undefined,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
    }));
    return { items, total: totalCount, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  // Lấy profile ứng viên theo userId
  // Lấy profile ứng viên theo userId
  async getByUserId(userId: string): Promise<CandidateProfileDetailDto | null> {
    const c = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!c) return null;
    return {
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      resumeUrl: c.resumeUrl ? '/api/candidate-profile/me/cv' : undefined,
      experience: c.experience ?? undefined,
      skills: c.skills ?? undefined,
      education: c.education ?? undefined,
      experienceYears: c.experienceYears ?? undefined,
      preferredLocation: c.preferredLocation ?? undefined,
      preferredJobType: c.preferredJobType ?? undefined,
      expectedSalary: c.expectedSalary ? Number(c.expectedSalary) : undefined,
      dob: c.dob
        ? c.dob instanceof Date
          ? c.dob.toISOString().slice(0, 10)
          : c.dob
        : undefined,
      gender: c.gender ?? undefined,
      portfolioUrl: c.portfolioUrl ?? undefined,
      linkedinUrl: c.linkedinUrl ?? undefined,
      githubUrl: c.githubUrl ?? undefined,
      certificates: c.certificates ?? undefined,
      summary: c.summary ?? undefined,
      email: c.user.email,
    };
  }

  // Cập nhật profile ứng viên
  // Cập nhật profile ứng viên
  // Cập nhật profile ứng viên, chỉ update nếu đã có, không tự động tạo mới
  async update(
    userId: string,
    dto: CandidateProfileUpdateDto,
  ): Promise<boolean> {
    try {
      console.log('Update candidateProfile:', { userId, dto });
      // Tách trường user và trường profile; resumeUrl chỉ được thay đổi qua endpoint upload.
      const { fullName, email, ...profileData } = dto;
      // Chuẩn hóa dob và loại bỏ undefined
      const cleanProfileData: any = {};
      for (const key in profileData) {
        if (profileData[key] !== undefined) {
          if (key === 'dob' && typeof profileData[key] === 'string') {
            // Nếu dob là string dạng YYYY-MM-DD thì convert sang Date, chỉ khi khác rỗng
            if (profileData.dob) {
              cleanProfileData.dob = new Date(profileData.dob as string);
            }
          } else {
            cleanProfileData[key] = profileData[key];
          }
        }
      }
      const profile = await this.prisma.candidateProfile.update({
        where: { userId },
        data: cleanProfileData,
      });
      if (fullName || email) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            ...(fullName ? { fullName } : {}),
            ...(email ? { email } : {}),
          },
        });
      }
      return !!profile;
    } catch (e) {
      console.error('Lỗi update candidateProfile:', e);
      return false;
    }
  }

  // Upload CV cho ứng viên với validation chuẩn
  async uploadCv(userId: string, file: any): Promise<string | null> {
    if (!file || !file.originalname) return null;

    FileUtil.validateCvFile(file.originalname, file.buffer.length, file.buffer);
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    const fileName = FileUtil.generateUniqueFileName();
    const uploadPath = FileUtil.getPrivateCvDirectory();
    FileUtil.ensureDirectoryExists(uploadPath);
    const filePath = FileUtil.resolvePrivateCvPath(fileName);
    if (!filePath) throw new Error('Không tạo được đường dẫn CV an toàn.');
    fs.writeFileSync(filePath, file.buffer, { flag: 'wx' });

    const previousPath = FileUtil.resolvePrivateCvPath(profile.resumeUrl);
    if (previousPath) FileUtil.deleteFileIfExists(previousPath);
    await this.prisma.candidateProfile.update({ where: { userId }, data: { resumeUrl: fileName } });
    return '/api/candidate-profile/me/cv';
  }

  // Xóa CV ứng viên với FileUtil
  async deleteCv(userId: string): Promise<boolean> {
    try {
      const profile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
      });
      if (!profile || !profile.resumeUrl) return false;

      const filePath = FileUtil.resolvePrivateCvPath(profile.resumeUrl);
      if (filePath) FileUtil.deleteFileIfExists(filePath);

      await this.prisma.candidateProfile.update({
        where: { userId },
        data: { resumeUrl: null },
      });

      return true;
    } catch {
      return false;
    }
  }

  async getCvFile(
    actorId: string,
    candidateId: string,
    isAdmin = false,
  ): Promise<{ buffer: Buffer; fileName: string } | null> {
    if (!isAdmin) {
      const application = await this.prisma.job.findFirst({
        where: { candidateId, jobPost: { employerId: actorId } },
        select: { id: true },
      });
      if (!application) throw new ForbiddenException('Bạn không có quyền tải CV này.');
    }
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId: candidateId } });
    const filePath = FileUtil.resolvePrivateCvPath(profile?.resumeUrl);
    if (!filePath || !fs.existsSync(filePath)) return null;
    return { buffer: fs.readFileSync(filePath), fileName: 'resume.pdf' };
  }
}
