import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
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

  // Sử dụng string để mapping enum Prisma UserRole
  @IsString()
  @IsOptional()
  role?: string; // 'Admin' | 'Recruiter' | 'Candidate'
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

  // Sử dụng string để mapping enum Prisma UserRole
  @IsString()
  role: string; // 'Admin' | 'Recruiter' | 'Candidate'

  @IsString()
  fullName: string;
}

// DTO trả về khi đăng nhập/đăng ký thành công
export class AuthResponseDto {
  token: string;
  user: UserDto;
}
