import { Module } from '@nestjs/common';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';
import { NotificationModule } from '../../user/notification/notification.module';

// Module quản lý ứng tuyển việc làm
@Module({
  imports: [NotificationModule],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
