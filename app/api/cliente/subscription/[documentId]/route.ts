import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';

export const fetchCache = 'force-no-store';

type Context = { params: Promise<{ documentId: string }> };

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function proxyUpstream(method: 'GET' | 'DELETE', documentId: string) {
  const url = new URL(`/api/cliente/subscription/${documentId}`, markketplace.api);

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 0 },
  });

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = await res.json();
    return NextResponse.json(payload, { status: res.status });
  }

  const text = await res.text();
  return new NextResponse(text, { status: res.status });
}

// GET /api/cliente/subscription/:documentId
// Returns masked email + store info — no auth required
export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { documentId } = await params;
    return await proxyUpstream('GET', documentId);
  } catch (error) {
    console.error('[cliente/subscription] GET failed:', error);
    return toError('Could not load subscription info.', 500);
  }
}

// DELETE /api/cliente/subscription/:documentId
// Marks subscriber as unsubscribed — record is never deleted
export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const { documentId } = await params;
    return await proxyUpstream('DELETE', documentId);
  } catch (error) {
    console.error('[cliente/subscription] DELETE failed:', error);
    return toError('Could not unsubscribe.', 500);
  }
}
