import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPostDto = {
      title: 'Test Post',
      content: 'Test content',
      slug: 'test-post',
    };
    const authorId = 'user-1';

    it('should create a new post successfully', async () => {
      const mockCreatedPost = { id: '1', ...createPostDto, authorId };
      mockPrismaService.post.create.mockResolvedValue(mockCreatedPost);

      const result = await service.create(createPostDto, authorId);

      expect(result).toEqual(mockCreatedPost);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          ...createPostDto,
          authorId,
        },
      });
    });

    it('should throw ConflictException if slug already exists (P2002)', async () => {
      const error = new Error('Unique constraint failed');
      (error as any).code = 'P2002';
      mockPrismaService.post.create.mockRejectedValue(error);

      await expect(service.create(createPostDto, authorId)).rejects.toThrow(
        new ConflictException('Slug already exists'),
      );
    });

    it('should rethrow other errors during creation', async () => {
      const error = new Error('Database error');
      mockPrismaService.post.create.mockRejectedValue(error);

      await expect(service.create(createPostDto, authorId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a post if found', async () => {
      const mockPost = {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        author: { username: 'testuser' },
      };
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne('test-post');

      expect(result).toEqual(mockPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-post' },
        include: { author: { select: { username: true } } },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Post not found'),
      );
    });
  });

  describe('findAll', () => {
    it('should return only published posts by default', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          published: true,
          createdAt: new Date(),
          author: { username: 'user1' },
        },
      ];
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll();

      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          createdAt: true,
          author: {
            select: {
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return all posts when publishedOnly is false', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Post 1',
          slug: 'post-1',
          published: true,
          createdAt: new Date(),
          author: { username: 'user1' },
        },
        {
          id: '2',
          title: 'Post 2',
          slug: 'post-2',
          published: false,
          createdAt: new Date(),
          author: { username: 'user1' },
        },
      ];
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll(false);

      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {},
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          createdAt: true,
          author: {
            select: {
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
