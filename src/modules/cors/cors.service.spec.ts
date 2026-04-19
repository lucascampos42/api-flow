import { Test, TestingModule } from '@nestjs/testing';
import { CorsService } from './cors.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('CorsService', () => {
  let service: CorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    allowedOrigin: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CorsService>(CorsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isOriginAllowed', () => {
    it('should return false if origin is undefined', async () => {
      const result = await service.isOriginAllowed(undefined);
      expect(result).toBe(false);
    });

    it('should return true for default allowed origins', async () => {
      // Defaults are: 'https://codesdevs.com.br', 'http://localhost:4200'
      mockPrismaService.allowedOrigin.findMany.mockResolvedValue([]);
      await service.onModuleInit();

      expect(await service.isOriginAllowed('https://codesdevs.com.br')).toBe(
        true,
      );
      expect(await service.isOriginAllowed('http://localhost:4200')).toBe(true);
    });

    it('should return true for origins loaded from database', async () => {
      mockPrismaService.allowedOrigin.findMany.mockResolvedValue([
        { url: 'https://example.com' },
      ]);
      await service.onModuleInit();

      expect(await service.isOriginAllowed('https://example.com')).toBe(true);
    });

    it('should return false for unknown origins', async () => {
      mockPrismaService.allowedOrigin.findMany.mockResolvedValue([]);
      await service.onModuleInit();

      expect(await service.isOriginAllowed('https://malicious.com')).toBe(
        false,
      );
    });
  });

  describe('addOrigin', () => {
    it('should add a new origin', async () => {
      const url = 'https://new-origin.com';
      mockPrismaService.allowedOrigin.findUnique.mockResolvedValue(null);
      mockPrismaService.allowedOrigin.create.mockResolvedValue({
        id: '1',
        url,
      });

      const result = await service.addOrigin(url);

      expect(result).toEqual({ id: '1', url });
      expect(prisma.allowedOrigin.create).toHaveBeenCalledWith({
        data: { url },
      });
      expect(await service.isOriginAllowed(url)).toBe(true);
    });

    it('should throw ConflictException if origin already exists', async () => {
      const url = 'https://existing.com';
      mockPrismaService.allowedOrigin.findUnique.mockResolvedValue({
        id: '1',
        url,
      });

      await expect(service.addOrigin(url)).rejects.toThrow(ConflictException);
    });
  });

  describe('removeOrigin', () => {
    it('should remove an origin', async () => {
      const url = 'https://to-remove.com';
      const id = '1';
      mockPrismaService.allowedOrigin.delete.mockResolvedValue({ id, url });

      // First add it so we can test if it's removed from the Set
      mockPrismaService.allowedOrigin.findUnique.mockResolvedValue(null);
      mockPrismaService.allowedOrigin.create.mockResolvedValue({ id, url });
      await service.addOrigin(url);

      const result = await service.removeOrigin(id);

      expect(result).toEqual({ id, url });
      expect(prisma.allowedOrigin.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(await service.isOriginAllowed(url)).toBe(false);
    });

    it('should not remove default origins from the Set', async () => {
      const url = 'https://codesdevs.com.br';
      const id = '1';
      mockPrismaService.allowedOrigin.delete.mockResolvedValue({ id, url });

      await service.onModuleInit(); // Load defaults
      await service.removeOrigin(id);

      expect(await service.isOriginAllowed(url)).toBe(true);
    });
  });

  describe('listOrigins', () => {
    it('should return all origins from database', async () => {
      const mockOrigins = [{ id: '1', url: 'https://a.com' }];
      mockPrismaService.allowedOrigin.findMany.mockResolvedValue(mockOrigins);

      const result = await service.listOrigins();

      expect(result).toEqual(mockOrigins);
      expect(prisma.allowedOrigin.findMany).toHaveBeenCalled();
    });
  });
});
