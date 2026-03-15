import { Injectable, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';

@Injectable()
export class CorsService implements OnModuleInit {
  private allowedOrigins: Set<string> = new Set();
  private readonly defaults = [
    'https://codesdevs.com.br',
    'http://localhost:4200',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const origins = await this.prisma.allowedOrigin.findMany();
    origins.forEach((o) => this.allowedOrigins.add(o.url));

    // Default allowed origins
    this.defaults.forEach((url) => this.allowedOrigins.add(url));
  }

  async addOrigin(url: string) {
    const existing = await this.prisma.allowedOrigin.findUnique({
      where: { url },
    });
    if (existing) {
      throw new ConflictException('Origin already allowed');
    }
    const result = await this.prisma.allowedOrigin.create({ data: { url } });
    this.allowedOrigins.add(url);
    return result;
  }

  async removeOrigin(id: string) {
    const result = await this.prisma.allowedOrigin.delete({ where: { id } });
    if (result && !this.defaults.includes(result.url)) {
      this.allowedOrigins.delete(result.url);
    }
    return result;
  }

  async listOrigins() {
    return this.prisma.allowedOrigin.findMany();
  }

  async isOriginAllowed(origin: string | undefined): Promise<boolean> {
    if (!origin) return true; // Allow non-browser requests (e.g. Postman)
    return this.allowedOrigins.has(origin);
  }
}
