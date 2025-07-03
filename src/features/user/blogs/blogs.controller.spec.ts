// Unit test cho BlogsController
import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogService } from './blogs.service';

describe('BlogsController', () => {
  let controller: BlogsController;
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogService,
          useValue: {
            getBlogsAsync: jest.fn(),
            getFeaturedBlogsAsync: jest.fn(),
            getBlogByIdAsync: jest.fn(),
            getBlogBySlugAsync: jest.fn(),
            createBlogAsync: jest.fn(),
            updateBlogAsync: jest.fn(),
            deleteBlogAsync: jest.fn(),
            getCategoriesAsync: jest.fn(),
            getPopularTagsAsync: jest.fn(),
            incrementViewsAsync: jest.fn(),
            toggleLikeAsync: jest.fn(),
            getStatsAsync: jest.fn(),
            getFeaturedAuthorsAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);
    service = module.get<BlogService>(BlogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get blogs', async () => {
    const result = { blogs: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    jest.spyOn(service, 'getBlogsAsync').mockResolvedValue(result as any);
    expect(await controller.getBlogs({} as any)).toEqual(result);
  });

  it('should get featured blogs', async () => {
    jest.spyOn(service, 'getFeaturedBlogsAsync').mockResolvedValue([]);
    expect(await controller.getFeaturedBlogs()).toEqual([]);
  });
});
