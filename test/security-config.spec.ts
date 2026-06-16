import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { SessionsService } from '../src/auth/sessions/sessions.service';

describe('Security Configuration', () => {
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'REFRESH_TOKEN_SECRET') {
                throw new Error('Configuration property "REFRESH_TOKEN_SECRET" is not defined');
              }
              return 'mock-value';
            }),
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: SessionsService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should throw an error if REFRESH_TOKEN_SECRET is missing in getTokens', async () => {
    const user = { id: '1', email: 'test@example.com', userType: 'USER' };

    // We expect getTokens to call configService.getOrThrow('REFRESH_TOKEN_SECRET')
    // which we mocked to throw an error.
    await expect(authService.getTokens('1', 'test@example.com', user))
      .rejects.toThrow('Configuration property "REFRESH_TOKEN_SECRET" is not defined');
  });
});
