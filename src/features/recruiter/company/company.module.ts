// Module quản lý công ty cho recruiter
import { Module } from '@nestjs/common';
import { RecruiterCompanyController } from './company.controller';
import { RecruiterCompanyService } from './company.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RecruiterCompanyController],
  providers: [RecruiterCompanyService, PrismaService],
  exports: [RecruiterCompanyService],
})
export class RecruiterCompanyModule {}
