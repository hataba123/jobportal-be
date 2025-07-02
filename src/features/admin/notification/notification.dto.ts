// DTO cho notification (admin)
import {
  IsUUID,
  IsString,
  IsDate,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class NotificationDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsString()
  message: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  read: boolean;

  @IsString()
  @IsOptional()
  type?: string;
}

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  type?: string;
}
