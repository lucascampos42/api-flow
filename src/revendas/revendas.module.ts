import { Module } from '@nestjs/common';
import { RevendasService } from './revendas.service';
import { RevendasController } from './revendas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { ProvisioningProcessor } from './queues/provisioning.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'provisioning-queue',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [RevendasController],
  providers: [RevendasService, ProvisioningProcessor],
  exports: [RevendasService],
})
export class RevendasModule {}
