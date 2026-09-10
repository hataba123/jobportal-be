// Controller quản lý blog cho user
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BlogService } from './blogs.service';
import { BlogSearchDto, CreateBlogDto, UpdateBlogDto } from './blogs.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AdminOnly, Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Blogs')
@Controller('api/blogs')
export class BlogsController {
  constructor(private readonly blogService: BlogService) {}

  // Lấy danh sách blog với filter/search
  @Get()
  async getBlogs(@Query() searchDto: BlogSearchDto) {
    return this.blogService.getBlogsAsync(searchDto);
  }

  // Lấy danh sách blog nổi bật
  @Get('featured')
  async getFeaturedBlogs() {
    return this.blogService.getFeaturedBlogsAsync();
  }

  // Lấy blog theo id
  @Get(':id')
  async getBlogById(@Param('id') id: number) {
    const result = await this.blogService.getBlogByIdAsync(id);
    if (!result) throw new NotFoundException();
    return result;
  }

  // Lấy blog theo slug
  @Get('slug/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    const result = await this.blogService.getBlogBySlugAsync(slug);
    if (!result) throw new NotFoundException();
    return result;
  }

  // Tạo blog mới
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Post()
  async createBlog(@Body() createDto: CreateBlogDto) {
    const result = await this.blogService.createBlogAsync(createDto);
    return result;
  }

  // Cập nhật blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Put(':id')
  async updateBlog(@Param('id') id: number, @Body() updateDto: UpdateBlogDto) {
    const result = await this.blogService.updateBlogAsync(id, updateDto);
    if (!result) throw new NotFoundException();
    return result;
  }

  // Xóa blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @Delete(':id')
  async deleteBlog(@Param('id') id: number) {
    const success = await this.blogService.deleteBlogAsync(id);
    if (!success) throw new NotFoundException();
    return { success: true };
  }

  // Lấy danh mục
  @Get('categories')
  async getCategories() {
    return this.blogService.getCategoriesAsync();
  }

  // Lấy tag phổ biến
  @Get('tags')
  async getPopularTags() {
    return this.blogService.getPopularTagsAsync();
  }

  // Tăng view cho blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1', '2')
  @Post(':id/views')
  async incrementViews(@Param('id') id: number, @Req() req) {
    await this.blogService.incrementViewsAsync(id, req.user.userId, req.ip);
    return { success: true };
  }

  // Like/unlike blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('0', '1', '2')
  @Post(':id/like')
  async toggleLike(@Param('id') id: number, @Req() req) {
    return this.blogService.toggleLikeAsync(id, req.user.userId);
  }

  // Lấy thống kê
  @Get('stats')
  async getStats() {
    return this.blogService.getStatsAsync();
  }

  // Lấy tác giả nổi bật
  @Get('authors/featured')
  async getFeaturedAuthors() {
    return this.blogService.getFeaturedAuthorsAsync();
  }
}
