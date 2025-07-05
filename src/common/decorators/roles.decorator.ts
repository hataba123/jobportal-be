// Decorator xác định quyền truy cập cho endpoint
import { SetMetadata } from '@nestjs/common';

// Decorator định nghĩa role required cho endpoint
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Constants để tránh magic string theo instruction
export const USER_ROLES = {
  ADMIN: '0',
  RECRUITER: '1',
  CANDIDATE: '2',
} as const;

// Enum để quản lý các giá trị cố định theo instruction
export enum UserRole {
  ADMIN = '0',
  RECRUITER = '1',
  CANDIDATE = '2',
}

// Helper decorators cho từng role cụ thể - giúp code dễ đọc hơn
export const AdminOnly = () => Roles(USER_ROLES.ADMIN);
export const RecruiterOnly = () => Roles(USER_ROLES.RECRUITER);
export const CandidateOnly = () => Roles(USER_ROLES.CANDIDATE);
export const AdminAndRecruiter = () =>
  Roles(USER_ROLES.ADMIN, USER_ROLES.RECRUITER);
export const RecruiterAndCandidate = () =>
  Roles(USER_ROLES.RECRUITER, USER_ROLES.CANDIDATE);
