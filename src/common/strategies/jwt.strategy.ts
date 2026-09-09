// Chiến lược xác thực JWT cho Passport - dùng cho bảo mật API
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
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
    const userId = payload.userId || payload.sub;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, passwordVersion: true },
    });
    if (!user || user.passwordVersion !== (payload.passwordVersion ?? 0)) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn.');
    }

    return {
      userId: user.id,
      email: user.email,
      role: payload.role,
    };
  }
}
