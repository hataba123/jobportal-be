// DTO yêu cầu đăng nhập OAuth
import { IsString } from 'class-validator';

export class OAuthLoginRequest {
  // Email
  @IsString()
  email: string;

  // Tên hiển thị
  @IsString()
  name: string;

  // Provider (google, github...)
  @IsString()
  provider: string;

  // Id tài khoản provider
  @IsString()
  providerAccountId: string;
}
