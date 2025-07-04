// Chiến lược xác thực JWT cho Passport - dùng cho bảo mật API
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // Lấy JWT_SECRET, nếu không có thì throw lỗi rõ ràng
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Validate payload sau khi giải mã token
  // Trả về object user chuẩn hóa cho req.user
  async validate(payload: any) {
    // Nếu payload có userId thì trả về luôn, nếu có sub thì map sang userId
    return {
      userId: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
