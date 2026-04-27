import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: PrismaHealthIndicator,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const revendaUrl = this.configService.get<string>('REVENDA_API_URL');
    const cdsGestorUrl = this.configService.get<string>('CDSGESTOR_API_URL');

    return this.health.check([
      () => this.db.pingCheck('database', this.prisma),
      () => this.http.pingCheck('api-revenda', `${revendaUrl}/health`),
      () => this.http.pingCheck('api-cdsgestor', `${cdsGestorUrl}/health`),
    ]);
  }
}
