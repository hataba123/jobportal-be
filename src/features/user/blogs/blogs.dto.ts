// DTO cho blog user
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO tác giả blog, role trả về dạng số (enum index)
export class BlogAuthorDto {
  @IsInt()
  id: number;
  @IsString()
  name: string;
  @IsString()
  avatar: string;
  @IsInt()
  role: number; // 0: Admin, 1: Recruiter, 2: Candidate
}

export class BlogCategoryDto {
  @IsInt()
  id: number;
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsInt()
  count: number;
}

export class BlogDto {
  @IsInt()
  id: number;
  @IsString()
  title: string;
  @IsString()
  excerpt: string;
  @IsString()
  content: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsString()
  category: string;
  @IsArray()
  tags: string[];
  @IsDate()
  publishedAt: Date;
  @IsString()
  readTime: string;
  @IsInt()
  views: number;
  @IsInt()
  likes: number;
  @IsBoolean()
  featured: boolean;
  @IsString()
  image: string;
  @IsDate()
  createdAt: Date;
  @IsDate()
  @IsOptional()
  updatedAt?: Date;
  @ValidateNested()
  author: BlogAuthorDto;
}

export class BlogResponseDto {
  @IsArray()
  blogs: BlogDto[];
  @IsInt()
  total: number;
  @IsInt()
  page: number;
  @IsInt()
  limit: number;
  @IsInt()
  totalPages: number;
}

export class BlogSearchDto {
  @IsString()
  @IsOptional()
  search?: string;
  @IsString()
  @IsOptional()
  category?: string;
  @IsString()
  @IsOptional()
  sort?: string;
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}

export class BlogStatsDto {
  @IsInt()
  totalBlogs: number;
  @IsInt()
  totalAuthors: number;
  @IsInt()
  totalViews: number;
  @IsInt()
  totalLikes: number;
}

export class CreateBlogDto {
  @IsString()
  title: string;
  @IsString()
  excerpt: string;
  @IsString()
  content: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsString()
  category: string;
  @IsArray()
  tags: string[];
  @IsString()
  readTime: string;
  @IsBoolean()
  @IsOptional()
  featured?: boolean;
  @IsString()
  image: string;
  @IsInt()
  authorId: number;
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  excerpt?: string;
  @IsString()
  @IsOptional()
  content?: string;
  @IsString()
  @IsOptional()
  slug?: string;
  @IsString()
  @IsOptional()
  category?: string;
  @IsArray()
  @IsOptional()
  tags?: string[];
  @IsString()
  @IsOptional()
  readTime?: string;
  @IsBoolean()
  @IsOptional()
  featured?: boolean;
  @IsString()
  @IsOptional()
  image?: string;
}
