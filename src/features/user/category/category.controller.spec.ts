// Unit test cho CategoryController
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getAllAsync: jest.fn(),
            getByIdAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all categories', async () => {
    jest.spyOn(service, 'getAllAsync').mockResolvedValue([]);
    expect(await controller.getAll()).toEqual([]);
  });

  it('should get category by id', async () => {
    jest
      .spyOn(service, 'getByIdAsync')
      .mockResolvedValue({ id: '1', name: 'IT' });
    expect(await controller.getById('1')).toEqual({ id: '1', name: 'IT' });
  });
});
