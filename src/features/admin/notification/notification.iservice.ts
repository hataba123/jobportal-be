// Interface service cho notification (admin)
import { NotificationDto, CreateNotificationDto } from './notification.dto';

export interface INotificationService {
  getAll(): Promise<NotificationDto[]>;
  getById(id: string): Promise<NotificationDto | null>;
  getByUserId(userId: string): Promise<NotificationDto[]>;
  create(dto: CreateNotificationDto): Promise<NotificationDto>;
  markAsRead(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
