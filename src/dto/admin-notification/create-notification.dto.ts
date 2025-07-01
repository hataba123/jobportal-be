// DTO dùng để tạo mới thông báo
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  // Id người dùng nhận thông báo
  @IsUUID()
  userId: string;

  // Nội dung thông báo
  @IsString()
  message: string = '';

  // Loại thông báo (có thể null)
  @IsOptional()
  @IsString()
  type?: string;
}
