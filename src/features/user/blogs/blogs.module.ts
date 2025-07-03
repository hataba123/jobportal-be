// Module quản lý blog cho user
import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogService } from './blogs.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BlogsController],
  providers: [BlogService, PrismaService],
  exports: [BlogService],
})
export class BlogsModule {}
