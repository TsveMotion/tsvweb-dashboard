import { NextRequest } from 'next/server';

const INTERNAL_API_KEY = process.env.DASHBOARD_API_KEY;

function getHeaderKey(request: NextRequest) {
  const headerValue = request.headers.get('x-dashboard-api-key');
  if (headerValue) {
    return headerValue.trim();
  }

  const authorization = request.headers.get('authorization');
  if (authorization) {
    const [, token] = authorization.split(' ');
    if (token) {
      return token.trim();
    }
  }

  return null;
}

export function hasValidApiKey(request: NextRequest) {
  if (!INTERNAL_API_KEY) {
    return true;
  }

  const headerKey = getHeaderKey(request);
  return Boolean(headerKey && headerKey === INTERNAL_API_KEY);
}

export function getExpectedApiKey() {
  return INTERNAL_API_KEY;
}
