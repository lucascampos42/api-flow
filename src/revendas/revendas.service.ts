import { Injectable, Logger, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRevendaDto } from './dto/create-revenda.dto';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RevendasService {
  private readonly logger = new Logger(RevendasService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('provisioning-queue') private provisioningQueue: Queue,
  ) {}

  async create(createRevendaDto: CreateRevendaDto) {
    const { provisionNow, systemIds, ...data } = createRevendaDto;

    try {
      const revenda = await this.prisma.revenda.create({
        data: {
          ...data,
          systems: {
            create: systemIds?.map(slug => ({
              systemSlug: slug
            })) || []
          }
        },
        include: {
          systems: true
        }
      });

      // Gerar o schemaName da Revenda (ex: revenda_dominio)
      const schemaName = `revenda_${revenda.domain.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;

      if (provisionNow !== false) {
        try {
          this.logger.log(`Adicionando job de provisionamento para ${schemaName} na fila.`);
          await this.provisioningQueue.add('provision', { schemaName });
        } catch (error) {
          this.logger.error(`Erro ao enfileirar provisionamento: ${(error as any).message}`);
        }
      }

      return revenda;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      if ((error as any).code === 'P2002') {
        throw new ConflictException('Revenda com este domínio ou documento já existe.');
      }
      this.logger.error(`Erro ao criar revenda: ${(error as any).message}`);
      throw new InternalServerErrorException('Erro ao criar revenda');
    }
  }

  async findAll() {
    return this.prisma.revenda.findMany({
      include: {
        systems: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const revenda = await this.prisma.revenda.findUnique({ 
      where: { id },
      include: { systems: true }
    });
    if (!revenda) throw new NotFoundException('Revenda não encontrada');
    return revenda;
  }

  async update(id: string, updateData: any) {
    const { systemIds, ...data } = updateData;

    return this.prisma.$transaction(async (tx) => {
      // 1. Atualizar dados básicos
      const revenda = await tx.revenda.update({
        where: { id },
        data
      });

      // 2. Se systemIds foi enviado, sincroniza os sistemas
      if (systemIds) {
        // Remove atuais
        await tx.revendaSystem.deleteMany({
          where: { revendaId: id }
        });

        // Adiciona novos
        if (systemIds.length > 0) {
          await tx.revendaSystem.createMany({
            data: systemIds.map((slug: string) => ({
              revendaId: id,
              systemSlug: slug
            }))
          });
        }
      }

      return tx.revenda.findUnique({
        where: { id },
        include: { systems: true }
      });
    });
  }

  async remove(id: string) {
    return this.prisma.revenda.delete({ where: { id } });
  }
}
