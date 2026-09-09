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
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  ChangePasswordRequestDto,
  ResetPasswordRequestDto,
} from './auth.dto';

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
    return this.signToken(user);
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
    return this.signToken(user);
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

    const token = this.signToken(user);
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

  async changePasswordAsync(
    userId: string,
    request: ChangePasswordRequestDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại.');

    const valid = await bcrypt.compare(request.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Mật khẩu hiện tại không đúng.');

    const passwordHash = await bcrypt.hash(request.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, passwordVersion: { increment: 1 } },
    });
  }

  async createPasswordResetRequest(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    // Email delivery is intentionally kept behind the notification provider.
    // The raw token is never persisted or returned by this endpoint.
  }

  async resetPasswordAsync(request: ResetPasswordRequestDto): Promise<void> {
    const tokenHash = this.hashResetToken(request.token);
    await this.prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
      });
      if (
        !resetToken ||
        resetToken.usedAt ||
        resetToken.expiresAt <= new Date()
      ) {
        throw new BadRequestException('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }

      const user = await tx.user.findUnique({ where: { id: resetToken.userId } });
      if (!user || user.email !== request.email) {
        throw new BadRequestException('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }

      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) {
        throw new BadRequestException('Mã đặt lại mật khẩu đã được sử dụng.');
      }

      const passwordHash = await bcrypt.hash(request.newPassword, 10);
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash, passwordVersion: { increment: 1 } },
      });
    });
  }

  private signToken(user: {
    id: string;
    email: string;
    role: string;
    passwordVersion: number;
  }): string {
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: this.mapUserRoleToIndex(user.role),
      passwordVersion: user.passwordVersion,
    });
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private normalizeRegistrationRole(role?: string | number): 'Candidate' | 'Recruiter' {
    if (role === undefined || role === null) return 'Candidate';
    if (role === 'Recruiter' || role === '1' || role === 1) return 'Recruiter';
    if (role === 'Candidate' || role === '2' || role === 2) return 'Candidate';
    throw new BadRequestException('Vai trò đăng ký không hợp lệ.');
  }
}
