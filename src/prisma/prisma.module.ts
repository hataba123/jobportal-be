import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Module global cho Prisma - cung cấp PrismaService cho toàn bộ ứng dụng
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
