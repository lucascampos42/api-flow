import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, role } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email ou Username já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role || Role.RESELLER,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async findAll(role?: Role) {
    const where = role ? { role } : {};
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOneUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    const { password: _, ...result } = user;
    return result;
  }

  async findOneByEmailOrUsername(identity: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identity }, { username: identity }],
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOneUser(id);
    if (!user) throw new NotFoundException('User not found');

    const { email, username, password } = updateUserDto;
    const data: any = {};

    if (email) data.email = email;
    if (username) data.username = username;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        tokenVersion: { increment: 1 },
      },
    });

    const { password: _, ...result } = updatedUser;
    return result;
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      const { password: _, ...result } = deletedUser;
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
