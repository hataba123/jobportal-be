// Interface service cho danh mục ngành nghề
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './category.dto';

export interface ICategoryService {
  getAllAsync(): Promise<CategoryDto[]>;
  getByIdAsync(id: string): Promise<CategoryDto | null>;
  createAsync(dto: CreateCategoryDto): Promise<CategoryDto>;
  updateAsync(id: string, dto: UpdateCategoryDto): Promise<CategoryDto | null>;
  deleteAsync(id: string): Promise<boolean>;
}
