import { createRateLimitHook } from './rate-limit.hook';

describe('rate limit hook', () => {
  it('limits sensitive requests by client IP and resets after a window', async () => {
    let currentTime = 1_000;
    const hook = createRateLimitHook(
      [{ prefix: '/api/auth', limit: 2 }],
      () => currentTime,
    );
    const sent: any[] = [];
    const reply = {
      header: jest.fn(),
      code: jest.fn().mockReturnThis(),
      send: jest.fn((body) => {
        sent.push(body);
        return body;
      }),
    };
    const request = { raw: { url: '/api/auth/login' }, ip: '127.0.0.1' };

    await hook(request, reply);
    await hook(request, reply);
    await hook(request, reply);
    expect(reply.code).toHaveBeenCalledWith(429);
    expect(sent).toHaveLength(1);

    currentTime += 60_000;
    await hook(request, reply);
    expect(reply.code).toHaveBeenCalledTimes(1);
  });
});
