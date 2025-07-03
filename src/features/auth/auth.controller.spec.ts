import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  OAuthLoginRequestDto,
  AuthResponseDto,
} from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerAsync: jest.fn().mockResolvedValue('token'),
            loginAsync: jest.fn().mockResolvedValue('token'),
            getUserByEmailAsync: jest
              .fn()
              .mockResolvedValue({
                id: '1',
                email: 'a',
                role: 'Candidate',
                fullName: 'A',
              }),
          },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should register', async () => {
    const req = { email: 'a', password: 'b', fullName: 'A' };
    await expect(controller.register(req as any)).resolves.toHaveProperty(
      'token',
    );
  });

  it('should login', async () => {
    const req = { email: 'a', password: 'b' };
    await expect(controller.login(req as any)).resolves.toHaveProperty('token');
  });

  it('should get me', async () => {
    const req = { user: { email: 'a' } };
    await expect(controller.me(req as any)).resolves.toHaveProperty('email');
  });
});
