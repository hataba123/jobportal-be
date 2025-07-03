// Unit test cho BlogService
import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blogs.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
