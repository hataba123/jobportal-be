// Service quản lý Prisma Client, dùng để inject vào các service khác
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Hàm khởi tạo Prisma Client
  async onModuleInit() {
    await this.$connect();
  }

  // Hàm dọn dẹp khi module bị destroy
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
