// DTO dùng để cập nhật trạng thái đơn ứng tuyển
import { IsString } from 'class-validator';

export class UpdateApplyStatusRequest {
  // Trạng thái mới
  @IsString()
  status: string = '';
}
