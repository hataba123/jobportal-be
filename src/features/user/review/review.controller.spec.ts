import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ReviewController', () => {
  let controller: ReviewController;
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: {
            getAllAsync: jest.fn().mockResolvedValue([]),
            getByCompanyAsync: jest.fn().mockResolvedValue([]),
            createAsync: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();
    controller = module.get<ReviewController>(ReviewController);
    service = module.get<ReviewService>(ReviewService);
  });

  it('should return all reviews', async () => {
    jest.spyOn(service, 'getAllAsync').mockResolvedValue([{ id: '1' } as any]);
    expect(await controller.getAll()).toEqual([{ id: '1' }]);
  });

  it('should return reviews by company', async () => {
    jest
      .spyOn(service, 'getByCompanyAsync')
      .mockResolvedValue([{ id: '2' } as any]);
    expect(await controller.getByCompany('2')).toEqual([{ id: '2' }]);
  });

  it('should create review', async () => {
    const req = { user: { userId: '1' } };
    const body = { companyId: '2', rating: 5, comment: 'Good' };
    await expect(controller.create(req, body)).resolves.toEqual({
      message: expect.any(String),
    });
  });
});
