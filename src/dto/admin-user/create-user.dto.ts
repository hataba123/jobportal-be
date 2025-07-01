// DTO dùng để tạo mới người dùng
import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

// Enum vai trò người dùng
export enum UserRole {
  Admin = 'Admin',
  Recruiter = 'Recruiter',
  Candidate = 'Candidate',
}

export class CreateUserDto {
  // Email người dùng
  @IsEmail()
  email: string;

  // Mật khẩu
  @IsString()
  @MinLength(6)
  password: string;

  // Họ tên đầy đủ
  @IsString()
  fullName: string;

  // Vai trò
  @IsEnum(UserRole)
  role: UserRole;
}
