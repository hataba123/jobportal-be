type RateLimitRule = {
  prefix: string;
  limit: number;
};

type RateLimitBucket = {
  startedAt: number;
  count: number;
};

const WINDOW_MS = 60_000;
const DEFAULT_RULES: RateLimitRule[] = [
  { prefix: '/api/auth', limit: 30 },
  { prefix: '/api/payment-orders', limit: 20 },
  { prefix: '/api/payments', limit: 60 },
];

/** Hook giới hạn lưu lượng cho các route nhạy cảm theo IP trong một phút. */
export function createRateLimitHook(
  rules: RateLimitRule[] = DEFAULT_RULES,
  now: () => number = Date.now,
) {
  const buckets = new Map<string, RateLimitBucket>();

  return async function rateLimitHook(request: any, reply: any): Promise<void> {
    const pathname = String(request.raw?.url ?? request.url ?? '').split('?')[0];
    const rule = rules.find((item) => pathname.startsWith(item.prefix));
    if (!rule) return;

    const ip = String(request.ip ?? 'unknown');
    const key = `${rule.prefix}:${ip}`;
    const currentTime = now();
    const existing = buckets.get(key);
    const bucket =
      !existing || currentTime - existing.startedAt >= WINDOW_MS
        ? { startedAt: currentTime, count: 0 }
        : existing;
    bucket.count += 1;
    buckets.set(key, bucket);

    if (buckets.size > 10_000) {
      for (const [bucketKey, value] of buckets) {
        if (currentTime - value.startedAt >= WINDOW_MS) buckets.delete(bucketKey);
      }
    }

    const remaining = Math.max(rule.limit - bucket.count, 0);
    if (bucket.count > rule.limit) {
      reply.header('Retry-After', '60');
      reply.header('X-RateLimit-Limit', String(rule.limit));
      reply.header('X-RateLimit-Remaining', '0');
      return reply.code(429).send({
        statusCode: 429,
        message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
        timestamp: new Date(currentTime).toISOString(),
        path: pathname,
      });
    }

    reply.header('X-RateLimit-Limit', String(rule.limit));
    reply.header('X-RateLimit-Remaining', String(remaining));
  };
}
