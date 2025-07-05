import { Test, TestingModule } from '@nestjs/testing';
import { SavedJobController } from './saved-job.controller';
import { SavedJobService } from './saved-job.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('SavedJobController', () => {
  let controller: SavedJobController;
  let service: SavedJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedJobController],
      providers: [
        {
          provide: SavedJobService,
          useValue: {
            getSavedJobsAsync: jest.fn().mockResolvedValue([]),
            saveJobAsync: jest.fn().mockResolvedValue(undefined),
            unsaveJobAsync: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();
    controller = module.get<SavedJobController>(SavedJobController);
    service = module.get<SavedJobService>(SavedJobService);
  });

  it('should return saved jobs', async () => {
    jest
      .spyOn(service, 'getSavedJobsAsync')
      .mockResolvedValue([{ id: '1' } as any]);
    const req = { user: { userId: '1' } };
    expect(await controller.getSavedJobs(req)).toEqual([{ id: '1' }]);
  });

  it('should save job', async () => {
    const req = { user: { userId: '1' } };
    await expect(controller.saveJob(req, '2')).resolves.toEqual({
      message: expect.any(String),
    });
  });

  it('should unsave job', async () => {
    const req = { user: { userId: '1' } };
    jest.spyOn(service, 'unsaveJobAsync').mockResolvedValue(true);
    await expect(controller.unsaveJob(req, '2')).resolves.toEqual({
      message: expect.any(String),
    });
  });

  it('should throw NotFoundException if unsave job fails', async () => {
    const req = { user: { userId: '1' } };
    jest.spyOn(service, 'unsaveJobAsync').mockResolvedValue(false);
    await expect(controller.unsaveJob(req, '2')).rejects.toThrow();
  });
});
