import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a liveness response without touching the database', () => {
    const controller = new HealthController({ $queryRaw: jest.fn() } as any);
    expect(controller.getLiveness()).toEqual(
      expect.objectContaining({ status: 'ok' }),
    );
  });

  it('reports readiness only when the database query succeeds', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const controller = new HealthController({ $queryRaw: queryRaw } as any);

    await expect(controller.getReadiness()).resolves.toEqual(
      expect.objectContaining({ status: 'ready' }),
    );
    expect(queryRaw).toHaveBeenCalledTimes(1);

    queryRaw.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(controller.getReadiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
