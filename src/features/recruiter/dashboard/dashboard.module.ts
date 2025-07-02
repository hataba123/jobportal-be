// Module dashboard recruiter
import { Module } from '@nestjs/common';
import { RecruiterDashboardController } from './dashboard.controller';
import { RecruiterDashboardService } from './dashboard.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RecruiterDashboardController],
  providers: [RecruiterDashboardService, PrismaService],
  exports: [RecruiterDashboardService],
})
export class RecruiterDashboardModule {}
