// DTO yêu cầu đăng nhập
import { IsString, IsBoolean } from 'class-validator';

export class LoginRequest {
  // Email
  @IsString()
  email: string;

  // Mật khẩu
  @IsString()
  password: string;

  // Đăng nhập qua OAuth hay không
  @IsBoolean()
  isOAuth: boolean = false;
}
