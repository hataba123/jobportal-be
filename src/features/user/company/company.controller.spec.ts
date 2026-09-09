import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;
  let service: { getAllAsync: jest.Mock; getByIdAsync: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: {
            getAllAsync: jest.fn().mockResolvedValue([]),
            getByIdAsync: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();
    controller = module.get(CompanyController);
    service = module.get(CompanyService);
  });

  it('returns all companies', async () => {
    await expect(controller.getAll()).resolves.toEqual([]);
  });

  it('throws when a company does not exist', async () => {
    await expect(controller.getById('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns a company by id', async () => {
    service.getByIdAsync.mockResolvedValue({ id: 'company-1' });
    await expect(controller.getById('company-1')).resolves.toEqual({ id: 'company-1' });
  });
});
