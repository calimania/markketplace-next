import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { readBearerToken } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

type OutboundPayload = {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  threadKey?: string;
  estado?: 'draft' | 'sent' | string;
  draft?: boolean;
  published?: boolean;
  inReplyTo?: string;
  references?: string | string[];
  headers?: Record<string, unknown>;
};

function toError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const token = readBearerToken(req);

    if (!token) {
      return toError('Authorization: Bearer <jwt> is required.', 401);
    }

    const body = (await req.json().catch(() => ({}))) as OutboundPayload;

    const to = (body.to || '').trim();
    const subject = (body.subject || '').trim();
    const text = (body.text || '').trim();
    const html = (body.html || '').trim();
    const threadKey = (body.threadKey || '').trim();

    if (body.inReplyTo || body.references || (body.headers && typeof body.headers === 'object')) {
      return toError('Do not send threading headers from client payload.', 400);
    }

    if (!to) {
      return toError('Missing required field: to.', 400);
    }

    if (!text && !html) {
      return toError('Missing content: provide text and/or html.', 400);
    }

    const safeSubject = subject || (threadKey ? `Re: ${threadKey}` : 'Message from CRM');

    const upstreamUrl = new URL('/api/inbox/outbound', markketplace.api);

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: safeSubject,
        ...(text ? { text } : {}),
        ...(html ? { html } : {}),
        ...(threadKey ? { threadKey } : {}),
        ...(body.estado ? { estado: body.estado } : {}),
        ...(typeof body.draft === 'boolean' ? { draft: body.draft } : {}),
        ...(typeof body.published === 'boolean' ? { published: body.published } : {}),
      }),
      next: { revalidate: 0 },
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const payload = await upstreamResponse.json();
      return NextResponse.json(payload, { status: upstreamResponse.status });
    }

    const textPayload = await upstreamResponse.text();
    return new NextResponse(textPayload, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentType || 'text/plain' },
    });
  } catch (error) {
    console.error('[crm/inbox/outbound] POST failed:', error);
    return toError(error instanceof Error ? error.message : 'Internal error', 500);
  }
}
