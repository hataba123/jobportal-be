// DTO đại diện cho thông báo
import {
  IsUUID,
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class NotificationDto {
  // Id thông báo
  @IsUUID()
  id: string;

  // Id người dùng nhận thông báo
  @IsUUID()
  userId: string;

  // Nội dung thông báo
  @IsString()
  message: string = '';

  // Thời gian tạo
  @IsDateString()
  createdAt: string;

  // Đã đọc hay chưa
  @IsBoolean()
  read: boolean;

  // Loại thông báo (có thể null)
  @IsOptional()
  @IsString()
  type?: string;
}
