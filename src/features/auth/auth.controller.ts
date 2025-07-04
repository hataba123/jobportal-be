// Controller xử lý xác thực (auth) cho user
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  OAuthLoginRequestDto,
  AuthResponseDto,
  UserDto,
  UserRoleStringToIndex,
} from './auth.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/auth')
// Controller xác thực tài khoản, đăng ký, đăng nhập, lấy thông tin user
export class AuthController {
  // Inject AuthService qua constructor
  constructor(private readonly authService: AuthService) {}

  // Đăng ký tài khoản mới
  // Trả về AuthResponseDto với user.role là số (enum index)
  /**
   * Đăng ký tài khoản mới
   * Luôn trả về object thuần, không throw lỗi bất ngờ, log lỗi nếu có
   */
  @Post('register')
  async register(@Body() request: RegisterRequestDto): Promise<any> {
    try {
      const token = await this.authService.registerAsync(request);
      if (!token) {
        return {
          token: '',
          user: null,
          error: 'Email đã được sử dụng.',
        };
      }
      const user = await this.authService.getUserByEmailAsync(request.email);
      // Trả về đúng kiểu AuthResponseDto, user luôn là UserDto (không null)
      if (!user) {
        return {
          token: token ?? '',
          user: {
            id: '',
            email: '',
            fullName: '',
            role: 2,
          },
          error: null,
        };
      }
      return {
        token: token ?? '',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName ?? '',
          role:
            typeof user.role === 'number'
              ? user.role
              : this.mapUserRoleToIndex(user.role),
        },
        error: null,
      };
    } catch (e) {
      // Log lỗi backend để debug
      console.error('Register error:', e);
      return {
        token: '',
        user: null,
        error: e?.message || 'Đăng ký thất bại',
      };
    }
  }

  // Đăng nhập tài khoản
  // Trả về AuthResponseDto với user.role là số (enum index)
  @Post('login')
  async login(@Body() request: LoginRequestDto): Promise<AuthResponseDto> {
    try {
      const token = await this.authService.loginAsync(request);
      const user = await this.authService.getUserByEmailAsync(request.email);
      return {
        token,
        user: this.toUserDtoOrThrow(user),
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Lấy thông tin user hiện tại từ token
  // Trả về UserDto với role là số (enum index)
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@Req() req): Promise<UserDto> {
    const email = req.user.email;
    if (!email)
      throw new HttpException(
        'Token không chứa email',
        HttpStatus.UNAUTHORIZED,
      );
    const user = await this.authService.getUserByEmailAsync(email);
    return this.toUserDtoOrThrow(user);
  }

  // Đăng nhập bằng OAuth (Google, Facebook...)
  // Nếu chưa có user thì tự động đăng ký, trả về AuthResponseDto với user.role là số
  @Post('oauth-login')
  async oauthLogin(
    @Body() request: OAuthLoginRequestDto,
  ): Promise<AuthResponseDto> {
    try {
      let user = await this.authService.getUserByEmailAsync(request.email);
      let token: string;
      if (!user) {
        // Đăng ký mới với role mặc định là Candidate
        const registerDto = new RegisterRequestDto();
        registerDto.email = request.email;
        registerDto.fullName = request.name;
        registerDto.password = Math.random().toString(36).slice(-8);
        registerDto.role = 'Candidate';
        token = await this.authService.registerAsync(registerDto);
        user = await this.authService.getUserByEmailAsync(request.email);
      } else {
        // Đăng nhập luôn
        const loginDto = new LoginRequestDto();
        loginDto.email = request.email;
        loginDto.password = '';
        loginDto.isOAuth = true;
        token = await this.authService.loginAsync(loginDto);
      }
      // Trả về đúng kiểu AuthResponseDto, user luôn là UserDto (không null)
      if (!user) {
        return {
          token: token ?? '',
          user: {
            id: '',
            email: '',
            fullName: '',
            role: 2,
          },
        };
      }
      return {
        token: token ?? '',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName ?? '',
          role:
            typeof user.role === 'number'
              ? user.role
              : this.mapUserRoleToIndex(user.role),
        },
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Hàm mapping role string sang index enum, throw nếu không hợp lệ
  // Hàm mapping role string/số sang index enum, hỗ trợ cả string số ('0','1','2'), không throw lỗi với dữ liệu cũ
  private mapUserRoleToIndex(role: string): number {
    const idx =
      UserRoleStringToIndex[role as keyof typeof UserRoleStringToIndex];
    if (idx !== undefined) return idx;
    if (!isNaN(Number(role))) {
      const num = Number(role);
      if (num >= 0 && num <= 2) return num;
    }
    return 2;
  }

  // Đảm bảo trả về user đúng chuẩn DTO, không có undefined
  private toUserDtoOrThrow(user: any): UserDto {
    if (!user)
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.NOT_FOUND,
      );
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? '', // fallback rỗng nếu thiếu
      role: this.mapUserRoleToIndex(user.role),
    };
  }
}
