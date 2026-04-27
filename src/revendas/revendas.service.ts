import { Injectable, Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRevendaDto } from './dto/create-revenda.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevendasService {
  private readonly logger = new Logger(RevendasService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createRevendaDto: CreateRevendaDto) {
    const { provisionNow, ...data } = createRevendaDto;

    try {
      const revenda = await this.prisma.revenda.create({
        data,
      });

      // Gerar o schemaName da Revenda (ex: revenda_dominio)
      const schemaName = `revenda_${revenda.domain.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;

      if (provisionNow !== false) {
        try {
          await this.callRevendaProvisioning(schemaName);
        } catch (error) {
          // Se falhar o provisionamento, opcionalmente removemos o registro
          await this.prisma.revenda.delete({ where: { id: revenda.id } });
          throw new InternalServerErrorException(`Falha ao provisionar schema na api-revenda: ${error.message}`);
        }
      }

      return revenda;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Revenda com este domínio ou documento já existe.');
      }
      throw new InternalServerErrorException('Erro ao criar revenda');
    }
  }

  private async callRevendaProvisioning(schemaName: string) {
    const revendaApiUrl = this.configService.get<string>('REVENDA_API_URL');
    const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!revendaApiUrl) {
      throw new Error('REVENDA_API_URL não configurada no api-flow');
    }

    const response = await fetch(`${revendaApiUrl}/internal/provisioning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': internalApiKey || '',
      },
      body: JSON.stringify({ schemaName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return true;
  }

  async findAll() {
    return this.prisma.revenda.findMany();
  }

  async findOne(id: string) {
    return this.prisma.revenda.findUnique({ where: { id } });
  }
}
