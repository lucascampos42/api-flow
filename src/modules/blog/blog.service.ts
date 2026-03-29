import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, authorId: string) {
    try {
      return await this.prisma.post.create({
        data: {
          ...createPostDto,
          authorId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Slug already exists');
      }
      throw error;
    }
  }

  async findAll(publishedOnly = true) {
    const where = publishedOnly ? { published: true } : {};
    return this.prisma.post.findMany({
      where,
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
  }

  async findOne(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: { author: { select: { username: true } } },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
