// Module quản lý công ty cho recruiter
import { Module } from '@nestjs/common';
import { RecruiterCompanyController } from './company.controller';
import { RecruiterCompanyService } from './company.service';

@Module({
  controllers: [RecruiterCompanyController],
  providers: [RecruiterCompanyService],
  exports: [RecruiterCompanyService],
})
export class RecruiterCompanyModule {}
