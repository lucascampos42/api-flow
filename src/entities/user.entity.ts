import { Role } from '@prisma/client';

export class User {
  id: string;
  email: string;
  username: string;
  cpfCnpj?: string;
  password: string;
  role: Role;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
