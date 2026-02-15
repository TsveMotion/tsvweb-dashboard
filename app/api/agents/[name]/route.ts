import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rateLimiter';
import { hasValidApiKey } from '@/lib/apiSecurity';
import { AGENT_PROFILES, buildAgentDetail } from '@/lib/agents';
import { buildCrmPayload } from '@/lib/crm';

const agentRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60_000,
  prefix: 'agent-detail',
});

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const rate = agentRateLimiter.check(request);
  if (!rate.allowed) {
    const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    response.headers.set('Retry-After', String(rate.retryAfterSeconds));
    return response;
  }

  if (!hasValidApiKey(request)) {
    return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 });
  }

  const agentRecord = AGENT_PROFILES.find((profile) => profile.slug === params.name);
  if (!agentRecord) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  try {
    const crm = await buildCrmPayload();
    const payload = buildAgentDetail(agentRecord.name, crm.leads);
    const response = NextResponse.json(payload);
    if (rate.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    }
    if (rate.resetAt) {
      response.headers.set('X-RateLimit-Reset', new Date(rate.resetAt).toISOString());
    }
    return response;
  } catch (error) {
    console.error('Agent detail request failed', error);
    return NextResponse.json({ error: 'Unable to fetch agent detail' }, { status: 502 });
  }
}
