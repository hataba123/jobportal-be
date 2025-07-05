// Service xử lý blog cho user
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BlogSearchDto,
  CreateBlogDto,
  UpdateBlogDto,
  BlogResponseDto,
  BlogDto,
  BlogCategoryDto,
  BlogStatsDto,
  BlogAuthorDto,
} from './blogs.dto';
import { IBlogService } from './blogs.iservice';

@Injectable()
export class BlogService implements IBlogService {
  private readonly logger = new Logger(BlogService.name);
  constructor(private readonly prisma: PrismaService) {}

  // Hàm chuyển role string sang index enum (0: Admin, 1: Recruiter, 2: Candidate)
  private mapUserRoleToIndex(role: string): number {
    switch (role) {
      case 'Admin':
        return 0;
      case 'Recruiter':
        return 1;
      case 'Candidate':
        return 2;
      default:
        return -1;
    }
  }

  // Lấy danh sách blog với filter/search
  async getBlogsAsync(searchDto: BlogSearchDto): Promise<BlogResponseDto> {
    try {
      const where: any = {};
      if (searchDto.search) {
        where.OR = [
          { title: { contains: searchDto.search, mode: 'insensitive' } },
          { excerpt: { contains: searchDto.search, mode: 'insensitive' } },
          { content: { contains: searchDto.search, mode: 'insensitive' } },
          { tags: { has: searchDto.search } },
        ];
      }
      if (searchDto.category && searchDto.category !== 'Tất cả') {
        where.category = searchDto.category;
      }
      let orderBy: any = { publishedAt: 'desc' };
      if (searchDto.sort) {
        switch (searchDto.sort.toLowerCase()) {
          case 'newest':
            orderBy = { publishedAt: 'desc' };
            break;
          case 'popular':
            orderBy = { views: 'desc' };
            break;
          case 'trending':
            orderBy = { likes: 'desc' };
            break;
        }
      }
      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const skip = (page - 1) * limit;
      const [total, blogs] = await this.prisma.$transaction([
        this.prisma.blog.count({ where }),
        this.prisma.blog.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: { author: true },
        }),
      ]);
      const blogDtos: BlogDto[] = blogs.map(this.mapToDto.bind(this));
      return {
        blogs: blogDtos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (ex) {
      this.logger.error('Error getting blogs', ex);
      throw ex;
    }
  }

  // Lấy danh sách blog nổi bật
  async getFeaturedBlogsAsync(): Promise<BlogDto[]> {
    try {
      const blogs = await this.prisma.blog.findMany({
        where: { featured: true },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        include: { author: true },
      });
      return blogs.map(this.mapToDto.bind(this)) as BlogDto[];
    } catch (ex) {
      this.logger.error('Error getting featured blogs', ex);
      throw ex;
    }
  }

  // Lấy blog theo id
  async getBlogByIdAsync(id: number): Promise<BlogDto | null> {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id },
        include: { author: true },
      });
      return blog ? this.mapToDto(blog) : null;
    } catch (ex) {
      this.logger.error(`Error getting blog by id: ${id}`, ex);
      throw ex;
    }
  }

  // Lấy blog theo slug
  async getBlogBySlugAsync(slug: string): Promise<BlogDto | null> {
    try {
      const blog = await this.prisma.blog.findFirst({
        where: { slug },
        include: { author: true },
      });
      return blog ? this.mapToDto(blog) : null;
    } catch (ex) {
      this.logger.error(`Error getting blog by slug: ${slug}`, ex);
      throw ex;
    }
  }

  // Tạo blog mới
  async createBlogAsync(createDto: CreateBlogDto): Promise<BlogDto> {
    try {
      const blog = await this.prisma.blog.create({
        data: {
          title: createDto.title,
          excerpt: createDto.excerpt,
          content: createDto.content,
          slug: createDto.slug,
          category: createDto.category,
          tags: JSON.stringify(createDto.tags),
          readTime: createDto.readTime,
          featured: createDto.featured ?? false,
          image: createDto.image,
          publishedAt: new Date(),
          authorId: createDto.authorId,
        },
        include: { author: true },
      });
      return this.mapToDto(blog);
    } catch (ex) {
      this.logger.error('Error creating blog', ex);
      throw ex;
    }
  }

  // Cập nhật blog
  async updateBlogAsync(
    id: number,
    updateDto: UpdateBlogDto,
  ): Promise<BlogDto | null> {
    try {
      const data: any = { ...updateDto, updatedAt: new Date() };
      if (updateDto.tags) {
        data.tags = JSON.stringify(updateDto.tags);
      }
      const blog = await this.prisma.blog.update({
        where: { id },
        data,
        include: { author: true },
      });
      return blog ? this.mapToDto(blog) : null;
    } catch (ex) {
      this.logger.error(`Error updating blog: ${id}`, ex);
      return null;
    }
  }

  // Xóa blog
  async deleteBlogAsync(id: number): Promise<boolean> {
    try {
      await this.prisma.blog.delete({ where: { id } });
      return true;
    } catch (ex) {
      this.logger.error(`Error deleting blog: ${id}`, ex);
      return false;
    }
  }

  // Lấy danh mục blog
  async getCategoriesAsync(): Promise<BlogCategoryDto[]> {
    try {
      const categories = await this.prisma.blog.groupBy({
        by: ['category'],
        _count: { category: true },
      });
      return categories.map((c, idx) => ({
        id: idx + 1,
        name: c.category,
        count: c._count.category,
      }));
    } catch (ex) {
      this.logger.error('Error getting categories', ex);
      throw ex;
    }
  }

  // Lấy tag phổ biến
  async getPopularTagsAsync(): Promise<string[]> {
    try {
      const allTags = await this.prisma.blog.findMany({
        select: { tags: true },
      });
      const tagCounts: Record<string, number> = {};
      allTags.forEach((b) => {
        let tags: string[] = [];
        try {
          tags = b.tags ? JSON.parse(b.tags) : [];
        } catch {
          tags = [];
        }
        tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
    } catch (ex) {
      this.logger.error('Error getting popular tags', ex);
      throw ex;
    }
  }

  // Tăng view cho blog
  async incrementViewsAsync(
    id: number,
    userId?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      await this.prisma.blog.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
      // Nếu có bảng BlogView thì insert thêm record view vào đó
    } catch (ex) {
      this.logger.error(`Error incrementing views for blog: ${id}`, ex);
      throw ex;
    }
  }

  // Like/unlike blog
  async toggleLikeAsync(id: number, userId: string): Promise<any> {
    // Cần bổ sung logic like/unlike theo schema thực tế
    return { likes: 0, isLiked: false };
  }

  // Lấy thống kê blog
  async getStatsAsync(): Promise<BlogStatsDto> {
    try {
      const [totalBlogs, totalAuthors, totalViews, totalLikes] =
        await this.prisma.$transaction([
          this.prisma.blog.count(),
          this.prisma.blogAuthor.count(),
          this.prisma.blog.aggregate({ _sum: { views: true } }),
          this.prisma.blog.aggregate({ _sum: { likes: true } }),
        ]);
      return {
        totalBlogs,
        totalAuthors,
        totalViews: totalViews._sum.views || 0,
        totalLikes: totalLikes._sum.likes || 0,
      };
    } catch (ex) {
      this.logger.error('Error getting blog stats', ex);
      throw ex;
    }
  }

  // Lấy tác giả nổi bật
  async getFeaturedAuthorsAsync(): Promise<BlogAuthorDto[]> {
    try {
      const authors = await this.prisma.blogAuthor.findMany({
        take: 5,
      });
      // Trả về danh sách tác giả với role là số (enum index)
      return authors.map((a) => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar || '',
        role: this.mapUserRoleToIndex(a.role ?? ''),
      }));
    } catch (ex) {
      this.logger.error('Error getting featured authors', ex);
      throw ex;
    }
  }

  // Chuyển entity sang DTO
  // Chuyển entity blog sang BlogDto, role trả về số
  private mapToDto(blog: any): BlogDto {
    let tags: string[] = [];
    try {
      tags = blog.tags ? JSON.parse(blog.tags) : [];
    } catch {
      tags = [];
    }
    return {
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      slug: blog.slug,
      category: blog.category,
      tags,
      publishedAt: blog.publishedAt,
      readTime: blog.readTime,
      views: blog.views,
      likes: blog.likes,
      featured: blog.featured,
      image: blog.image,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author
        ? {
            id: blog.author.id,
            name: blog.author.name,
            avatar: blog.author.avatar || '',
            role: this.mapUserRoleToIndex(blog.author.role ?? ''),
          }
        : { id: 0, name: '', avatar: '', role: -1 },
    };
  }
}
