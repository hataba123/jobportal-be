// Module quản lý blog cho user
import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogService } from './blogs.service';

@Module({
  controllers: [BlogsController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogsModule {}
