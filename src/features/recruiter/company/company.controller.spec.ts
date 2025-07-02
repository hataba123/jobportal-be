// Unit test cho RecruiterCompanyController
import { Test, TestingModule } from '@nestjs/testing';
import { RecruiterCompanyController } from './company.controller';
import { RecruiterCompanyService } from './company.service';

describe('RecruiterCompanyController', () => {
  let controller: RecruiterCompanyController;
  let service: RecruiterCompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruiterCompanyController],
      providers: [
        {
          provide: RecruiterCompanyService,
          useValue: {
            getMyCompany: jest.fn(),
            updateMyCompany: jest.fn(),
            deleteMyCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecruiterCompanyController>(
      RecruiterCompanyController,
    );
    service = module.get<RecruiterCompanyService>(RecruiterCompanyService);
  });

  // Test lấy thông tin công ty
  it('should return company info', async () => {
    const mockCompany = {
      id: 'uuid',
      name: 'Test Company',
      openJobs: 0,
      rating: 0,
    };
    jest.spyOn(service, 'getMyCompany').mockResolvedValue(mockCompany as any);
    const req = { user: { userId: 'reer-id' } };
    expect(await controller.getMyCompany(req)).toEqual(mockCompany);
  });

  // Test cập nhật công ty
  it('should update company info', async () => {
    jest.spyOn(service, 'updateMyCompany').mockResolvedValue(true);
    const req = { user: { userId: 'recruiter-id' } };
    await expect(
      controller.updateMyCompany(req, { name: 'New Name' }),
    ).resolves.toBeUndefined();
  });

  // Test xóa công ty
  it('should delete company', async () => {
    jest.spyOn(service, 'deleteMyCompany').mockResolvedValue(true);
    const req = { user: { userId: 'recruiter-id' } };
    await expect(controller.deleteMyCompany(req)).resolves.toBeUndefined();
  });
});
