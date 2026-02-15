import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rateLimiter';
import { hasValidApiKey } from '@/lib/apiSecurity';

interface MessageEntry {
  id: string;
  from: string;
  to: string;
  message: string;
  time: string;
}

const rateLimiter = createRateLimiter({
  maxRequests: 40,
  windowMs: 60_000,
  prefix: 'messages',
});

let messageStore: MessageEntry[] = [
  {
    id: 'msg-1',
    from: 'Nova',
    to: 'Sales',
    message: 'Reminder: pipeline update scheduled at 15:00 GMT.',
    time: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'msg-2',
    from: 'Sales',
    to: 'Hunter',
    message: 'Can you surface the new high-value salons for tomorrow?',
    time: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'msg-3',
    from: 'PM',
    to: 'Dev',
    message: 'Need a patch for the dashboard logs before QA begins.',
    time: new Date(Date.now() - 660000).toISOString(),
  },
];

function trimMessages() {
  messageStore = messageStore.slice(0, 30);
}

function ensureAuthorized(request: NextRequest) {
  if (!hasValidApiKey(request)) {
    return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const rate = rateLimiter.check(request);
  if (!rate.allowed) {
    const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    response.headers.set('Retry-After', String(rate.retryAfterSeconds));
    return response;
  }

  const unauthorized = ensureAuthorized(request);
  if (unauthorized) {
    return unauthorized;
  }

  const response = NextResponse.json({ messages: messageStore });
  if (rate.remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
  }
  if (rate.resetAt) {
    response.headers.set('X-RateLimit-Reset', new Date(rate.resetAt).toISOString());
  }
  return response;
}

export async function POST(request: NextRequest) {
  const rate = rateLimiter.check(request);
  if (!rate.allowed) {
    const response = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    response.headers.set('Retry-After', String(rate.retryAfterSeconds));
    return response;
  }

  const unauthorized = ensureAuthorized(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as {
      from: string;
      to: string;
      message: string;
    };

    const entry: MessageEntry = {
      ...payload,
      id: `msg-${Date.now()}`,
      time: new Date().toISOString(),
    };

    messageStore = [entry, ...messageStore];
    trimMessages();

    const response = NextResponse.json({ success: true, messages: messageStore });
    if (rate.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    }
    if (rate.resetAt) {
      response.headers.set('X-RateLimit-Reset', new Date(rate.resetAt).toISOString());
    }
    return response;
  } catch (error) {
    console.error('Unable to accept message', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
