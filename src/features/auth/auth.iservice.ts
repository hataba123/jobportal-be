import { RegisterRequestDto, LoginRequestDto, UserDto } from './auth.dto';

// Interface service cho auth
export interface IAuthService {
  registerAsync(request: RegisterRequestDto): Promise<string>;
  loginAsync(request: LoginRequestDto): Promise<string>;
  getUserByEmailAsync(email: string): Promise<UserDto | null>;
}
