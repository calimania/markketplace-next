import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { readBearerToken } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function proxyRequest(method: string, upstreamUrl: URL, token: string, body?: unknown) {
  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: { revalidate: 0 },
  });

  const contentType = upstreamResponse.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await upstreamResponse.json();
    return NextResponse.json(payload, { status: upstreamResponse.status });
  }

  const text = await upstreamResponse.text();
  return new NextResponse(text, {
    status: upstreamResponse.status,
    headers: { 'Content-Type': contentType || 'text/plain' },
  });
}

// GET /api/crm/subscribers?storeRef=<slug>&syncStatus=<status>&q=<search>&page=1&pageSize=25
export async function GET(req: NextRequest) {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return toError('Authorization: Bearer <jwt> is required.', 401);
    }

    const upstreamUrl = new URL('/api/crm/subscribers', markketplace.api);
    upstreamUrl.search = req.nextUrl.searchParams.toString();

    return await proxyRequest('GET', upstreamUrl, token);
  } catch (error) {
    console.error('[crm/subscribers] GET failed:', error);
    return toError(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
