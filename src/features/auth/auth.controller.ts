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
} from './auth.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Đăng ký tài khoản mới
  @Post('register')
  async register(
    @Body() request: RegisterRequestDto,
  ): Promise<AuthResponseDto> {
    try {
      const token = await this.authService.registerAsync(request);
      const user = await this.authService.getUserByEmailAsync(request.email);
      if (!user)
        throw new HttpException(
          'Không tìm thấy người dùng',
          HttpStatus.NOT_FOUND,
        );
      if (!user)
        throw new HttpException(
          'Không tìm thấy người dùng',
          HttpStatus.NOT_FOUND,
        );
      return { token, user: user! };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Đăng nhập
  @Post('login')
  async login(@Body() request: LoginRequestDto): Promise<AuthResponseDto> {
    try {
      const token = await this.authService.loginAsync(request);
      const user = await this.authService.getUserByEmailAsync(request.email);
      if (!user)
        throw new HttpException(
          'Không tìm thấy người dùng',
          HttpStatus.NOT_FOUND,
        );
      if (!user)
        throw new HttpException(
          'Không tìm thấy người dùng',
          HttpStatus.NOT_FOUND,
        );
      return { token, user: user };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Lấy thông tin user hiện tại
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    const email = req.user.email;
    if (!email)
      throw new HttpException(
        'Token không chứa email',
        HttpStatus.UNAUTHORIZED,
      );
    const user = await this.authService.getUserByEmailAsync(email);
    if (!user)
      throw new HttpException(
        'Không tìm thấy người dùng',
        HttpStatus.NOT_FOUND,
      );
    return user;
  }

  // Đăng nhập bằng OAuth
  @Post('oauth-login')
  async oauthLogin(
    @Body() request: OAuthLoginRequestDto,
  ): Promise<AuthResponseDto> {
    try {
      let user = await this.authService.getUserByEmailAsync(request.email);
      let token: string;
      if (!user) {
        // Đăng ký mới
        const registerDto = new RegisterRequestDto();
        registerDto.email = request.email;
        registerDto.fullName = request.name;
        registerDto.password = Math.random().toString(36).slice(-8);
        // Role mặc định là Candidate
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
      return { token, user: user! };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
}
