import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

const controllerWith = (queryRaw: () => Promise<unknown>) =>
  new HealthController({ $queryRaw: queryRaw } as unknown as PrismaService);

describe('HealthController', () => {
  it('signale la base joignable quand la requête passe', async () => {
    const controller = controllerWith(() =>
      Promise.resolve([{ '?column?': 1 }]),
    );
    await expect(controller.check()).resolves.toEqual({
      api: 'ok',
      base: 'ok',
    });
  });

  it('répond 503 quand la base est injoignable', async () => {
    const controller = controllerWith(() =>
      Promise.reject(new Error('ECONNREFUSED')),
    );
    const error = await controller.check().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getResponse()).toEqual({
      api: 'ok',
      base: 'injoignable',
    });
  });
});
