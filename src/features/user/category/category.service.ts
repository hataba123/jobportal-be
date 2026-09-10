// Service xử lý danh mục ngành nghề cho user
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { ICategoryService } from './category.iservice';

@Injectable()
export class CategoryService implements ICategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy tất cả danh mục
  async getAllAsync(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany();
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon || undefined,
      color: c.color || undefined,
    }));
  }

  // Lấy danh mục theo id
  async getByIdAsync(id: string): Promise<CategoryDto | null> {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      icon: c.icon || undefined,
      color: c.color || undefined,
    };
  }

  // Tạo danh mục mới
  async createAsync(dto: CreateCategoryDto): Promise<CategoryDto> {
    const created = await this.prisma.category.create({
      data: {
        name: dto.name,
        icon: dto.icon || null,
        color: dto.color || null,
      },
    });
    return {
      id: created.id,
      name: created.name,
      icon: created.icon || undefined,
      color: created.color || undefined,
    };
  }

  // Cập nhật danh mục
  async updateAsync(id: string, dto: UpdateCategoryDto): Promise<CategoryDto | null> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) return null;
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      icon: updated.icon || undefined,
      color: updated.color || undefined,
    };
  }

  // Xóa danh mục
  async deleteAsync(id: string): Promise<boolean> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) return false;
    await this.prisma.category.delete({ where: { id } });
    return true;
  }
}
