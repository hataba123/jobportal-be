// DTO cho danh mục ngành nghề
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CategoryDto {
  @IsUUID()
  id: string;
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  icon?: string;
  @IsString()
  @IsOptional()
  color?: string;
}
