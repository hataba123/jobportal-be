import { Module } from '@nestjs/common';
import { JobPostService } from './job-post.service';
import { JobPostController } from './job-post.controller';
import { PrismaService } from 'src/prisma/prisma.service';

// Module quản lý job post
@Module({
  controllers: [JobPostController],
  providers: [JobPostService, PrismaService],
  exports: [JobPostService],
})
export class JobPostModule {}
