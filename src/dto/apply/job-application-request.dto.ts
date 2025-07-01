// DTO dùng để gửi yêu cầu ứng tuyển
import { IsUUID, IsString } from 'class-validator';

export class JobApplicationRequest {
  // Id bài đăng việc làm
  @IsUUID()
  jobPostId: string;

  // Đường dẫn CV
  @IsString()
  cvUrl: string;
}
