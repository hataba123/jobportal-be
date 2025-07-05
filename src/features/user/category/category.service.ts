// Service xử lý danh mục ngành nghề cho user
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CategoryDto } from './category.dto';
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
}
