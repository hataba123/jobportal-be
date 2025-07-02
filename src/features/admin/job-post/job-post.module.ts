// Module quản lý job post cho admin
import { Module } from '@nestjs/common';
import { JobPostController } from './job-post.controller';
import { JobPostService } from './job-post.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [JobPostController],
  providers: [JobPostService, PrismaService],
  exports: [JobPostService],
})
export class JobPostModule {}
