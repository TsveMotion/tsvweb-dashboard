import { NextResponse } from 'next/server';
import { buildCrmPayload } from '@/lib/crm';

export async function GET() {
  try {
    const payload = await buildCrmPayload();
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Failed to load CRM data', error);
    return NextResponse.json({ error: 'Unable to fetch CRM updates' }, { status: 502 });
  }
}
