import { Module } from '@nestjs/common';
import { RevendasService } from './revendas.service';
import { RevendasController } from './revendas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RevendasController],
  providers: [RevendasService],
  exports: [RevendasService],
})
export class RevendasModule {}
