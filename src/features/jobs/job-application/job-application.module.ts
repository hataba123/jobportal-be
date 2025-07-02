import { Module } from '@nestjs/common';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';
import { PrismaService } from 'src/prisma/prisma.service';

// Module quản lý ứng tuyển việc làm
@Module({
  controllers: [JobApplicationController],
  providers: [JobApplicationService, PrismaService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
