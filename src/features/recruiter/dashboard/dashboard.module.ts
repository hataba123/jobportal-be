// Module dashboard recruiter
import { Module } from '@nestjs/common';
import { RecruiterDashboardController } from './dashboard.controller';
import { RecruiterDashboardService } from './dashboard.service';

@Module({
  controllers: [RecruiterDashboardController],
  providers: [RecruiterDashboardService],
  exports: [RecruiterDashboardService],
})
export class RecruiterDashboardModule {}
