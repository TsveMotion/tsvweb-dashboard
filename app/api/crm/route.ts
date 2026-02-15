import { NextRequest, NextResponse } from 'next/server';
import { buildCrmPayload } from '@/lib/crm';
import { createRateLimiter } from '@/lib/rateLimiter';

const crmRateLimiter = createRateLimiter({
  maxRequests: 45,
  windowMs: 60_000,
  prefix: 'crm',
});

export async function GET(request: NextRequest) {
  const rate = crmRateLimiter.check(request);
  if (!rate.allowed) {
    const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    response.headers.set('Retry-After', String(rate.retryAfterSeconds));
    return response;
  }

  try {
    const payload = await buildCrmPayload();
    const response = NextResponse.json(payload);
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining ?? 0));
    if (rate.resetAt) {
      response.headers.set('X-RateLimit-Reset', new Date(rate.resetAt).toISOString());
    }
    return response;
  } catch (error) {
    console.error('Failed to load CRM data', error);
    return NextResponse.json({ error: 'Unable to fetch CRM updates' }, { status: 502 });
  }
}
