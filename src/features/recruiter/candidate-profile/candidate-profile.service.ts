﻿// Service xử lý logic Candidate Profile cho recruiter/candidate
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FileUtil } from '../../../common/utils/file.util';
import { APP_CONSTANTS } from '../../../common/constants/app.constants';
import {
  CandidateProfileBriefDto,
  CandidateProfileDetailDto,
  CandidateProfileUpdateDto,
  CandidateApplicationDto,
  CandidateSearchRequest,
} from './candidate-profile.dto';
import { IRecruiterCandidateService } from './candidate-profile.iservice';

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
      education: c.education ?? undefined,
    }));
  }

  // Lấy chi tiết ứng viên theo recruiter
  // Lấy chi tiết ứng viên theo recruiter
  async getCandidateById(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateProfileDetailDto | null> {
    const c = await this.prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: { user: true },
    });
    if (!c) return null;
    return {
      id: c.id,
      userId: c.userId,
      fullName: c.user.fullName,
      resumeUrl: c.resumeUrl ?? undefined,
      experience: c.experience ?? undefined,
      skills: c.skills ?? undefined,
      education: c.education ?? undefined,
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
        jobPost: {
          company: { userId: recruiterId },
        },
      },
      include: { jobPost: true },
    });
    return jobs.map((j) => ({
      jobId: j.id,
      jobPostId: j.jobPostId,
      jobTitle: j.jobPost.title,
      appliedAt: j.appliedAt,
      cvUrl: j.cvUrl ?? '',
      status: j.status,
    }));
  }

  // Lấy danh sách ứng viên đã ứng tuyển vào job của recruiter
  // Lấy danh sách ứng viên đã ứng tuyển vào job của recruiter
  async getCandidatesForRecruiter(
    recruiterId: string,
  ): Promise<CandidateProfileBriefDto[]> {
    const candidateIds = await this.prisma.job.findMany({
      where: {
        jobPost: { company: { userId: recruiterId } },
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
      education: c.education ?? undefined,
    }));
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
      resumeUrl: c.resumeUrl ?? undefined,
      experience: c.experience ?? undefined,
      skills: c.skills ?? undefined,
      education: c.education ?? undefined,
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
      // Tách trường user và trường profile
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

    // Sử dụng FileUtil để validate file
    FileUtil.validateCvFile(file.originalname, file.buffer.length);

    // Tạo tên file unique
    const fileName = FileUtil.generateUniqueFileName(file.originalname);
    const uploadPath = require('path').join(
      process.cwd(),
      'wwwroot',
      APP_CONSTANTS.UPLOAD_PATHS.CV,
    );

    // Đảm bảo thư mục tồn tại
    FileUtil.ensureDirectoryExists(uploadPath);

    const filePath = require('path').join(uploadPath, fileName);
    require('fs').writeFileSync(filePath, file.buffer);

    const url = `/${APP_CONSTANTS.UPLOAD_PATHS.CV}/${fileName}`;

    // Cập nhật database
    await this.prisma.candidateProfile.update({
      where: { userId },
      data: { resumeUrl: url },
    });

    return url;
  }

  // Xóa CV ứng viên với FileUtil
  async deleteCv(userId: string): Promise<boolean> {
    try {
      const profile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
      });
      if (!profile || !profile.resumeUrl) return false;

      const filePath = require('path').join(
        process.cwd(),
        'wwwroot',
        profile.resumeUrl.replace(/^\//, ''),
      );

      // Sử dụng FileUtil để xóa file
      FileUtil.deleteFileIfExists(filePath);

      await this.prisma.candidateProfile.update({
        where: { userId },
        data: { resumeUrl: null },
      });

      return true;
    } catch {
      return false;
    }
  }
}
