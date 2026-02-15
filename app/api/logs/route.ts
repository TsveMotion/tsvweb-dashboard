import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rateLimiter';
import { buildCrmPayload } from '@/lib/crm';

const streamLimiter = createRateLimiter({
  maxRequests: 50,
  windowMs: 60_000,
  prefix: 'log-stream',
});

export async function GET(request: NextRequest) {
  const rate = streamLimiter.check(request);
  if (!rate.allowed) {
    const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    response.headers.set('Retry-After', String(rate.retryAfterSeconds));
    return response;
  }

  try {
    const payload = await buildCrmPayload();

    const logs = payload.activityFeed.map((activity, index) => ({
      id: `${activity.agent}-${index}`,
      ...activity,
      source: 'CRM import',
    }));

    const spreadsheetSnapshot = [...payload.leads]
      .sort((a, b) => {
        const aTime = new Date(a.dateAdded || a.followUpDate || Date.now()).getTime();
        const bTime = new Date(b.dateAdded || b.followUpDate || Date.now()).getTime();
        return bTime - aTime;
      })
      .slice(0, 6)
      .map((lead) => ({
        business: lead.businessName,
        status: lead.status ?? 'New',
        nextAction: lead.nextAction ?? 'Triage',
        followUp: lead.followUpDate ?? '—',
      }));

    const response = NextResponse.json({
      lastSynced: payload.lastSynced,
      logs,
      spreadsheetSnapshot,
    });

    if (rate.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    }
    if (rate.resetAt) {
      response.headers.set('X-RateLimit-Reset', new Date(rate.resetAt).toISOString());
    }

    return response;
  } catch (error) {
    console.error('Unable to stream logs', error);
    return NextResponse.json({ error: 'Unable to stream logs' }, { status: 502 });
  }
}
