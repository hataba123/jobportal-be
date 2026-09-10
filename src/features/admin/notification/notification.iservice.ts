// Interface service cho notification (admin)
import { NotificationDto, CreateNotificationDto } from './notification.dto';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

export interface INotificationService {
  getAll(): Promise<NotificationDto[]>;
  getAllPaged(query: PageQueryDto): Promise<PagedResult<NotificationDto>>;
  getById(id: string): Promise<NotificationDto | null>;
  getByUserId(userId: string): Promise<NotificationDto[]>;
  getByUserIdPaged(userId: string, query: PageQueryDto): Promise<PagedResult<NotificationDto>>;
  create(dto: CreateNotificationDto): Promise<NotificationDto>;
  markAsRead(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
