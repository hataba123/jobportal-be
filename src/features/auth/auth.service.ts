// Service xử lý xác thực (auth) cho user
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterRequestDto, LoginRequestDto, UserDto } from './auth.dto';
import { IAuthService } from './auth.iservice';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Đăng ký tài khoản mới
  async registerAsync(request: RegisterRequestDto): Promise<string> {
    const existing = await this.prisma.user.findUnique({
      where: { email: request.email },
    });
    if (existing) throw new BadRequestException('Email đã được sử dụng.');
    const hash = await bcrypt.hash(request.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: request.email,
        fullName: request.fullName,
        passwordHash: hash,
        // Ép kiểu về đúng enum của Prisma (UserRole)
        role: (request.role as any) || 'Candidate',
      },
    });
    // Nếu là Candidate thì tạo hồ sơ rỗng
    if (user.role === 'Candidate') {
      await this.prisma.candidateProfile.create({
        data: { userId: user.id },
      });
    }
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  // Đăng nhập
  async loginAsync(request: LoginRequestDto): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { email: request.email },
    });
    if (!user) throw new BadRequestException('Tài khoản không tồn tại.');
    if (!request.isOAuth) {
      const valid = await bcrypt.compare(request.password, user.passwordHash);
      if (!valid)
        throw new BadRequestException('Email hoặc mật khẩu không đúng.');
    }
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  // Lấy user theo email
  async getUserByEmailAsync(email: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
  }
}
