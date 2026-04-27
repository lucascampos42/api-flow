import { SetMetadata } from '@nestjs/common';
import { UserType } from '@prisma/client';

export const UserTypes = (...userTypes: UserType[]) =>
  SetMetadata('userTypes', userTypes);
