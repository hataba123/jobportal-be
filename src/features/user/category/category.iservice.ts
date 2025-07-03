// Interface service cho danh mục ngành nghề
import { CategoryDto } from './category.dto';

export interface ICategoryService {
  getAllAsync(): Promise<CategoryDto[]>;
  getByIdAsync(id: string): Promise<CategoryDto | null>;
}
