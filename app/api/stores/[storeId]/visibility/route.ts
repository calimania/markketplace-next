import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { readBearerToken } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest, context: { params: Promise<{ storeId: string }> }) {
  try {
    const token = readBearerToken(req);
    const { storeId: storeRef } = await context.params;

    if (!storeRef) {
      return toError('store reference is required.', 400);
    }

    const upstreamUrl = new URL(`/api/stores/${encodeURIComponent(storeRef)}/visibility`, markketplace.api);
    upstreamUrl.search = req.nextUrl.searchParams.toString();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
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
    console.error('[stores/visibility] GET failed:', error);
    return toError(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
