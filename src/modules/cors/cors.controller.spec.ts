import { Test, TestingModule } from '@nestjs/testing';
import { CorsController } from './cors.controller';
import { CorsService } from './cors.service';
import { CreateOriginDto } from './dto/create-origin.dto';

describe('CorsController', () => {
  let controller: CorsController;
  let service: CorsService;

  const mockCorsService = {
    addOrigin: jest.fn(),
    removeOrigin: jest.fn(),
    listOrigins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorsController],
      providers: [
        {
          provide: CorsService,
          useValue: mockCorsService,
        },
      ],
    }).compile();

    controller = module.get<CorsController>(CorsController);
    service = module.get<CorsService>(CorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addOrigin', () => {
    it('should add a new origin', async () => {
      const dto: CreateOriginDto = { url: 'https://example.com' };
      const expectedResult = { id: '1', url: dto.url };
      mockCorsService.addOrigin.mockResolvedValue(expectedResult);

      const result = await controller.addOrigin(dto);

      expect(result).toEqual(expectedResult);
      expect(service.addOrigin).toHaveBeenCalledWith(dto.url);
    });
  });

  describe('removeOrigin', () => {
    it('should remove an origin', async () => {
      const id = '1';
      const expectedResult = { id, url: 'https://example.com' };
      mockCorsService.removeOrigin.mockResolvedValue(expectedResult);

      const result = await controller.removeOrigin(id);

      expect(result).toEqual(expectedResult);
      expect(service.removeOrigin).toHaveBeenCalledWith(id);
    });
  });

  describe('listOrigins', () => {
    it('should list all origins', async () => {
      const expectedResult = [{ id: '1', url: 'https://example.com' }];
      mockCorsService.listOrigins.mockResolvedValue(expectedResult);

      const result = await controller.listOrigins();

      expect(result).toEqual(expectedResult);
      expect(service.listOrigins).toHaveBeenCalled();
    });
  });
});
