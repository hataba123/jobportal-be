// Service xử lý xác thực (auth) cho user
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  UserDto,
  UserRoleStringToIndex,
  UserRoleEnum,
} from './auth.dto';
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
  // Trả về JWT token, role trong token là số (enum index)
  async registerAsync(request: RegisterRequestDto): Promise<string> {
    // Kiểm tra email đã tồn tại, nếu có thì trả về null (không throw lỗi)
    const existing = await this.prisma.user.findUnique({
      where: { email: request.email },
    });
    if (existing) return '';
    const hash = await bcrypt.hash(request.password, 10);
    // Xử lý role: FE có thể gửi string ('Admin', 'Recruiter', 'Candidate') hoặc số (0,1,2)
    let prismaRole: string = 'Candidate';
    if (typeof request.role === 'string') {
      // Nếu FE gửi string số ("1", "2") thì convert sang number
      if (!isNaN(Number(request.role))) {
        const found = Object.entries(UserRoleStringToIndex).find(
          ([, v]) => Number(v) === Number(request.role),
        );
        prismaRole = found ? found[0] : 'Candidate';
      } else {
        prismaRole = request.role;
      }
    } else if (typeof request.role === 'number') {
      // Map index về string
      const found = Object.entries(UserRoleStringToIndex).find(
        ([, v]) => Number(v) === request.role,
      );
      prismaRole = found ? found[0] : 'Candidate';
    }
    const user = await this.prisma.user.create({
      data: {
        email: request.email,
        fullName: request.fullName,
        passwordHash: hash,
        role: prismaRole as any,
      },
    });
    // Nếu là Candidate thì tạo hồ sơ rỗng
    if (user.role === 'Candidate') {
      await this.prisma.candidateProfile.create({
        data: { userId: user.id },
      });
    }
    // Đảm bảo role trong JWT là số (enum index)
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: this.mapUserRoleToIndex(user.role),
    });
  }

  // Đăng nhập
  // Đăng nhập, trả về JWT token với role là số (enum index)
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
    // Đảm bảo role trong JWT là số (enum index)
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: this.mapUserRoleToIndex(user.role),
    });
  }

  // Hàm mapping role string/số sang index enum, hỗ trợ cả string số ('0','1','2'), không throw lỗi với dữ liệu cũ
  private mapUserRoleToIndex(role: string): number {
    // Nếu là enum string
    const idx =
      UserRoleStringToIndex[role as keyof typeof UserRoleStringToIndex];
    if (idx !== undefined) return idx;
    // Nếu là string số ('0','1','2') hoặc number
    if (!isNaN(Number(role))) {
      const num = Number(role);
      if (num >= 0 && num <= 2) return num;
    }
    // Nếu không hợp lệ thì trả về Candidate (2) mặc định, không throw lỗi
    return 2;
  }

  // Lấy user theo email
  // Lấy user theo email, trả về UserDto với role là số (enum index)
  async getUserByEmailAsync(email: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: this.mapUserRoleToIndex(user.role),
      fullName: user.fullName,
    };
  }
}
