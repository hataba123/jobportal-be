import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterRequestDto, LoginRequestDto, UserDto } from './auth.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest
                .fn()
                .mockResolvedValue({
                  id: '1',
                  email: 'a',
                  fullName: 'A',
                  passwordHash: 'h',
                  role: 'Candidate',
                }),
            },
            candidateProfile: {
              create: jest.fn().mockResolvedValue({}),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should register', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue(null);
    prisma.user.create = jest
      .fn()
      .mockResolvedValue({
        id: '1',
        email: 'a',
        fullName: 'A',
        passwordHash: 'h',
        role: 'Candidate',
      });
    prisma.candidateProfile.create = jest.fn().mockResolvedValue({});
    await expect(
      service.registerAsync({
        email: 'a',
        password: 'b',
        fullName: 'A',
        role: 'Candidate',
      } as any),
    ).resolves.toBe('token');
  });

  it('should login', async () => {
    prisma.user.findUnique = jest
      .fn()
      .mockResolvedValue({
        id: '1',
        email: 'a',
        fullName: 'A',
        passwordHash: await bcrypt.hash('b', 10),
        role: 'Candidate',
      });
    await expect(
      service.loginAsync({ email: 'a', password: 'b' } as any),
    ).resolves.toBe('token');
  });

  it('should get user by email', async () => {
    prisma.user.findUnique = jest
      .fn()
      .mockResolvedValue({
        id: '1',
        email: 'a',
        fullName: 'A',
        passwordHash: 'h',
        role: 'Candidate',
      });
    await expect(service.getUserByEmailAsync('a')).resolves.toHaveProperty(
      'id',
    );
  });
});
