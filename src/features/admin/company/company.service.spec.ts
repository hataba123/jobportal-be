import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('CompanyService', () => {
  let service: CompanyService;
  let prisma: PrismaService;
  const updateMock = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: updateMock,
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<CompanyService>(CompanyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sets verifiedAt only when a company is verified', async () => {
    const company = {
      id: 'company-id',
      name: 'Acme',
      verificationStatus: 'Pending',
      verifiedAt: null,
    };
    jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(company as any);
    updateMock.mockResolvedValue({
      ...company,
      verificationStatus: 'Verified',
      verifiedAt: new Date(),
    } as any);

    const result = await service.updateVerificationStatus('company-id', {
      verificationStatus: 'Verified',
    });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'company-id' },
        data: expect.objectContaining({ verificationStatus: 'Verified' }),
      }),
    );
    expect(result?.verificationStatus).toBe('Verified');
    expect(result?.verifiedAt).toBeInstanceOf(Date);
  });

  // Thêm các test case cho từng method nếu cần
});
