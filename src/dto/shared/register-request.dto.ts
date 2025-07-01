// DTO yêu cầu đăng ký tài khoản
import { IsString, IsEnum } from 'class-validator';
import { UserRole } from './user.dto';

export class RegisterRequest {
  // Email
  @IsString()
  email: string;

  // Mật khẩu
  @IsString()
  password: string;

  // Họ tên đầy đủ
  @IsString()
  fullName: string;

  // Vai trò
  @IsEnum(UserRole)
  role: UserRole;
}
