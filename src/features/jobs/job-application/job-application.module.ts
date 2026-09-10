import { Module } from '@nestjs/common';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';
import { NotificationModule } from '../../user/notification/notification.module';
import { EmailNotificationModule } from '../../../common/email/email-notification.module';
import { ApplicationWorkflowService } from './application-workflow.service';
import { AdminJobApplicationController } from './admin-job-application.controller';

// Module quản lý ứng tuyển việc làm
@Module({
  imports: [NotificationModule, EmailNotificationModule],
  controllers: [JobApplicationController, AdminJobApplicationController],
  providers: [JobApplicationService, ApplicationWorkflowService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
