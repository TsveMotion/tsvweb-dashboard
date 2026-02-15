import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  windowEnd: number;
}

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  prefix?: string;
}

const bucketStore = new Map<string, RateLimitEntry>();

function resolveIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { maxRequests, windowMs, prefix = 'rl' } = options;

  return {
    check(request: NextRequest) {
      const now = Date.now();
      const ip = resolveIp(request);
      const bucketKey = `${prefix}-${ip}`;
      const entry = bucketStore.get(bucketKey);

      if (entry && entry.windowEnd <= now) {
        bucketStore.delete(bucketKey);
      }

      const current = bucketStore.get(bucketKey) ?? { count: 0, windowEnd: now + windowMs };

      if (now > current.windowEnd) {
        current.count = 0;
        current.windowEnd = now + windowMs;
      }

      if (current.count >= maxRequests) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((current.windowEnd - now) / 1000)),
        };
      }

      current.count += 1;
      bucketStore.set(bucketKey, current);

      return {
        allowed: true,
        remaining: maxRequests - current.count,
        resetAt: current.windowEnd,
      };
    },
  };
}
