// Controller quản lý danh mục ngành nghề cho user
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Lấy tất cả danh mục
  @Get()
  async getAll() {
    return this.categoryService.getAllAsync();
  }

  // Lấy danh mục theo id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const category = await this.categoryService.getByIdAsync(id);
    if (!category) throw new NotFoundException();
    return category;
  }
}
