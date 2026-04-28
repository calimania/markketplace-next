import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { readBearerToken } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// POST /api/crm/subscribers/:documentId/sync
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ documentId: string }> },
) {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return toError('Authorization: Bearer <jwt> is required.', 401);
    }

    const { documentId } = await context.params;

    if (!documentId) {
      return toError('documentId is required.', 400);
    }

    const upstreamUrl = new URL(`/api/crm/subscribers/${documentId}/sync`, markketplace.api);

    let body: unknown;
    try {
      const raw = await req.text();
      body = raw.trim() ? JSON.parse(raw) : undefined;
    } catch {
      body = undefined;
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
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
  } catch (error) {
    console.error('[crm/subscribers/sync] POST failed:', error);
    return toError(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
