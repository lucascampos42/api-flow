import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReseller', () => {
    it('should create a reseller', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const expectedResult = { id: '1', ...createUserDto, role: Role.RESELLER };
      delete (expectedResult as any).password;
      mockUserService.create.mockResolvedValue(expectedResult);

      const result = await controller.createReseller(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(createUserDto.role).toBe(Role.RESELLER);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('listResellers', () => {
    it('should list all resellers', async () => {
      const expectedResult = [
        { id: '1', username: 'reseller1', role: Role.RESELLER },
      ];
      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.listResellers();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(Role.RESELLER);
    });
  });

  describe('findAll', () => {
    it('should list all users', async () => {
      const expectedResult = [{ id: '1', username: 'user1', role: Role.ADMIN }];
      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should find one user by id', async () => {
      const expectedResult = { id: '1', username: 'user1' };
      mockUserService.findOneUser.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(service.findOneUser).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updatedUser' };
      const expectedResult = { id: '1', username: 'updatedUser' };
      mockUserService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedResult = { id: '1', username: 'user1' };
      mockUserService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
