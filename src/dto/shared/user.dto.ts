// DTO đại diện cho người dùng (dùng chung)
import { IsUUID, IsString, IsEnum } from 'class-validator';

export enum UserRole {
  Admin = 'Admin',
  Recruiter = 'Recruiter',
  Candidate = 'Candidate',
}

export class UserDto {
  // Id người dùng
  @IsUUID()
  id: string;

  // Email
  @IsString()
  email: string;

  // Vai trò
  @IsEnum(UserRole)
  role: UserRole;

  // Họ tên đầy đủ
  @IsString()
  fullName: string;
}
