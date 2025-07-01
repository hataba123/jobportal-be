// DTO trả về khi đăng nhập thành công
import { IsString, ValidateNested } from 'class-validator';
import { UserDto } from './user.dto';

export class AuthResponse {
  // Token truy cập
  @IsString()
  token: string;

  // Thông tin người dùng
  @ValidateNested()
  user: UserDto;
}
