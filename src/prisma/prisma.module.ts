import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserContextService } from '../common/context/user-context.service';

@Global()
@Module({
  providers: [PrismaService, UserContextService],
  exports: [PrismaService, UserContextService],
})
export class PrismaModule {}
