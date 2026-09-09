// Service xử lý xác thực (auth) cho user
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  OAuthLoginRequestDto,
  UserDto,
  UserRoleStringToIndex,
  UserRoleEnum,
} from './auth.dto';
import { IAuthService } from './auth.iservice';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';

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
    const prismaRole = this.normalizeRegistrationRole(request.role);
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
    const valid = await bcrypt.compare(request.password, user.passwordHash);
    if (!valid) throw new BadRequestException('Email hoặc mật khẩu không đúng.');
    // Đảm bảo role trong JWT là số (enum index)
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: this.mapUserRoleToIndex(user.role),
    });
  }

  async oauthLoginAsync(
    request: OAuthLoginRequestDto,
    exchangeSecret: string | undefined,
  ): Promise<{ token: string; user: UserDto }> {
    const expectedSecret = process.env.OAUTH_EXCHANGE_SECRET;
    if (!expectedSecret || exchangeSecret !== expectedSecret) {
      throw new UnauthorizedException('OAuth exchange không hợp lệ.');
    }

    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: request.provider,
          providerAccountId: request.providerAccountId,
        },
      },
      include: { user: true },
    });

    let user = existingAccount?.user;
    if (!user) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: request.email },
      });
      if (existingEmail) {
        throw new BadRequestException(
          'Email đã tồn tại. Hãy đăng nhập bằng mật khẩu trước khi liên kết OAuth.',
        );
      }

      const passwordHash = await bcrypt.hash(
        `${request.provider}:${request.providerAccountId}:${randomUUID()}`,
        10,
      );
      user = await this.prisma.user.create({
        data: {
          email: request.email,
          fullName: request.name,
          passwordHash,
          role: 'Candidate',
          oauthAccounts: {
            create: {
              provider: request.provider,
              providerAccountId: request.providerAccountId,
            },
          },
          candidateProfile: { create: {} },
        },
      });
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: this.mapUserRoleToIndex(user.role),
    });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: this.mapUserRoleToIndex(user.role),
      },
    };
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

  private normalizeRegistrationRole(role?: string | number): 'Candidate' | 'Recruiter' {
    if (role === undefined || role === null) return 'Candidate';
    if (role === 'Recruiter' || role === '1' || role === 1) return 'Recruiter';
    if (role === 'Candidate' || role === '2' || role === 2) return 'Candidate';
    throw new BadRequestException('Vai trò đăng ký không hợp lệ.');
  }
}
