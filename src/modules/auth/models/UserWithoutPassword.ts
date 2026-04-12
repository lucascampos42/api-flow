import { Role } from '@prisma/client';

export interface UserWithoutPassword {
  id: string;
  email: string;
  username: string;
  role: Role;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
