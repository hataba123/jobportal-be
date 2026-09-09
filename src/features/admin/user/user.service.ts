// Service xử lý logic user cho admin
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserDto, CreateUserDto, UpdateUserDto, UserRole } from './user.dto';
import { IUserService } from './user.iservice';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả user
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });
    return users.map((u) => this.toDto(u));
  }

  // Lấy user theo id
  async getUserById(id: string): Promise<UserDto | null> {
    const u = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return u ? this.toDto(u) : null;
  }

  // Tạo mới user
  async createUser(dto: CreateUserDto): Promise<UserDto> {
    const hash = await bcrypt.hash(dto.password, 10);
    const u = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        passwordHash: hash,
      },
    });
    return this.toDto(u);
  }

  // Cập nhật user
  async updateUser(id: string, dto: UpdateUserDto): Promise<boolean> {
    try {
      const existing = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) return false;
      const u = await this.prisma.user.update({ where: { id }, data: dto });
      return !!u;
    } catch {
      return false;
    }
  }

  // Xóa user
  async deleteUser(id: string): Promise<boolean> {
    try {
      const existing = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) return false;
      const deletedAt = new Date();
      const u = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id },
          data: {
            deletedAt,
            passwordVersion: { increment: 1 },
          },
        });
        await tx.jobPost.updateMany({
          where: { employerId: id, deletedAt: null },
          data: { deletedAt, status: 'Closed' },
        });
        await tx.company.updateMany({
          where: { userId: id, deletedAt: null },
          data: { deletedAt },
        });
        return updated;
      });
      return !!u;
    } catch {
      return false;
    }
  }

  // Chuyển entity sang DTO
  private toDto(entity: any): UserDto {
    return {
      id: entity.id,
      email: entity.email,
      fullName: entity.fullName,
      role: entity.role,
    };
  }
}
