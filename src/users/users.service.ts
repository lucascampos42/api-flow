import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private generatePassword(length = 12): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  async create(createUserDto: CreateUserDto) {
    const generatedPassword = this.generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const data: any = {
      name: createUserDto.name,
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      role: createUserDto.role,
      mustChangePassword: true,
    };
    if (createUserDto.cpf !== undefined) data.cpf = createUserDto.cpf;
    if (createUserDto.revendaId !== undefined)
      data.revendaId = createUserDto.revendaId;

    const user = await this.prisma.user.create({
      data,
    });

    return {
      ...user,
      generatedPassword,
    };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        cpf: true,
        role: true,
        active: true,
        revendaId: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByIdentifier(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { cpf: identifier },
        ],
      },
    });
    return user;
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
