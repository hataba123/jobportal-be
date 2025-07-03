// Interface service cho blog user
import {
  BlogSearchDto,
  CreateBlogDto,
  UpdateBlogDto,
  BlogResponseDto,
  BlogDto,
  BlogCategoryDto,
  BlogStatsDto,
} from './blogs.dto';

export interface IBlogService {
  getBlogsAsync(searchDto: BlogSearchDto): Promise<BlogResponseDto>;
  getFeaturedBlogsAsync(): Promise<BlogDto[]>;
  getBlogByIdAsync(id: number): Promise<BlogDto | null>;
  getBlogBySlugAsync(slug: string): Promise<BlogDto | null>;
  createBlogAsync(createDto: CreateBlogDto): Promise<BlogDto>;
  updateBlogAsync(
    id: number,
    updateDto: UpdateBlogDto,
  ): Promise<BlogDto | null>;
  deleteBlogAsync(id: number): Promise<boolean>;
  getCategoriesAsync(): Promise<BlogCategoryDto[]>;
  getPopularTagsAsync(): Promise<string[]>;
  incrementViewsAsync(
    id: number,
    userId?: string,
    ipAddress?: string,
  ): Promise<void>;
  toggleLikeAsync(id: number, userId: string): Promise<any>;
  getStatsAsync(): Promise<BlogStatsDto>;
  getFeaturedAuthorsAsync(): Promise<any[]>;
}
