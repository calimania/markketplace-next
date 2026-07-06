import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { readBearerToken } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return toError('Authorization: Bearer <jwt> is required.', 401);
    }

    const store = (req.nextUrl.searchParams.get('store') || '').trim();
    const storeId = (req.nextUrl.searchParams.get('storeId') || '').trim();

    if (!store && !storeId) {
      return toError('Missing required store context: provide store or storeId.', 400);
    }

    const upstreamUrl = new URL('/api/inbox', markketplace.api);
    const params = new URLSearchParams(req.nextUrl.searchParams.toString());

    // Default behavior for CRM consumers: hide archived threads unless explicitly requested.
    if (!params.has('archived')) {
      params.set('archived', 'false');
    }

    upstreamUrl.search = params.toString();

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
  } catch (error) {
    console.error('[crm/inbox] GET failed:', error);
    return toError(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
