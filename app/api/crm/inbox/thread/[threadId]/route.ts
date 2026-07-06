import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { readBearerToken } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function toShortThreadId(value?: string | null) {
  const source = String(value || '').trim();
  if (!source) return '';
  const segments = source.split('/').filter(Boolean);
  return (segments[segments.length - 1] || source).trim();
}

function looksLikeCompositeThreadKey(value: string) {
  return value.includes('::') || value.includes('|') || value.includes('@');
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return toError('Authorization: Bearer <jwt> is required.', 401);
    }

    const params = await context.params;
    const threadId = toShortThreadId(params.threadId);

    if (!threadId) {
      return toError('Missing threadId route parameter.', 400);
    }

    if (looksLikeCompositeThreadKey(threadId)) {
      return toError('Invalid threadId format. Use inbox documentId/id, not composite threadKey.', 400);
    }

    const upstreamUrl = new URL(`/api/inbox/thread/${encodeURIComponent(threadId)}`, markketplace.api);

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

    const responseText = await upstreamResponse.text();
    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentType || 'text/plain' },
    });
  } catch (error) {
    console.error('[crm/inbox/thread] GET failed:', error);
    return toError(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
