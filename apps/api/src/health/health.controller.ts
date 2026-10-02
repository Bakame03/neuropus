import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type HealthReport = { api: 'ok'; base: 'ok' | 'injoignable' };

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthReport> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // 503 : l'API répond mais ne peut rien faire d'utile sans sa base.
      throw new ServiceUnavailableException({
        api: 'ok',
        base: 'injoignable',
      } satisfies HealthReport);
    }
    return { api: 'ok', base: 'ok' };
  }
}
