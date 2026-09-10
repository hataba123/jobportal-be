import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogService } from '../audit/audit-log.service';
import { OutboxService } from '../outbox/outbox.service';
import { BackgroundProcessingService } from '../background/background-processing.service';
import { EmailNotificationModule } from '../email/email-notification.module';

@Global()
@Module({
  imports: [PrismaModule, EmailNotificationModule],
  providers: [AuditLogService, OutboxService, BackgroundProcessingService],
  exports: [AuditLogService, OutboxService, BackgroundProcessingService],
})
export class InfrastructureModule {}
