// Enum TypeScript mapping role string <-> index
export enum UserRoleEnum {
  Admin = 0,
  Recruiter = 1,
  Candidate = 2,
}

export const UserRoleStringToIndex: Record<string, UserRoleEnum> = {
  Admin: UserRoleEnum.Admin,
  Recruiter: UserRoleEnum.Recruiter,
  Candidate: UserRoleEnum.Candidate,
};
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  ValidateIf,
} from 'class-validator';

// DTO đăng ký tài khoản
export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  // Cho phép FE gửi string hoặc number cho role
  @ValidateIf((o) => typeof o.role === 'string')
  @IsString()
  @ValidateIf((o) => typeof o.role === 'number')
  @IsNumber()
  @IsOptional()
  role?: string | number; // 'Admin' | 'Recruiter' | 'Candidate' hoặc 0 | 1 | 2
}

// DTO đăng nhập
export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  isOAuth?: boolean = false;
}

// DTO đăng nhập OAuth
export class OAuthLoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  provider: string;

  @IsString()
  providerAccountId: string;
}

// DTO user trả về cho FE
export class UserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  // Sử dụng number để mapping enum index cho FE
  @IsNumber()
  role: number; // 0: Admin, 1: Recruiter, 2: Candidate

  @IsString()
  fullName: string;
}

// DTO trả về khi đăng nhập/đăng ký thành công
export class AuthResponseDto {
  token: string;
  user: UserDto;
}
