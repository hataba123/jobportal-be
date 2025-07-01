// DTO dùng để cập nhật người dùng
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  // Email người dùng
  @IsOptional()
  @IsEmail()
  email?: string;

  // Họ tên đầy đủ
  @IsOptional()
  @IsString()
  fullName?: string;

  // Vai trò
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
