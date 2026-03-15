import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('should delete a user and return result without password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedResult } = mockUser;
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(result).toEqual(expectedResult);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found (P2025)', async () => {
      const error = new Error('User not found');
      (error as any).code = 'P2025';
      mockPrismaService.user.delete.mockRejectedValue(error);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Some other error');
      mockPrismaService.user.delete.mockRejectedValue(error);

      await expect(service.remove('1')).rejects.toThrow('Some other error');
    });
  });
});
