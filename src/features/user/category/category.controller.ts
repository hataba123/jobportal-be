// Controller quản lý danh mục ngành nghề cho user
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
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

  // Tạo danh mục
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createAsync(dto);
  }

  // Cập nhật danh mục
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.categoryService.updateAsync(id, dto);
    if (!category) throw new NotFoundException();
    return category;
  }

  // Xóa danh mục
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const success = await this.categoryService.deleteAsync(id);
    if (!success) throw new NotFoundException();
    return { success: true };
  }
}
