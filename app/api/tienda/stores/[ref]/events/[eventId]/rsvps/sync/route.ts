import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

async function handler(
  req: NextRequest,
  context: { params: Promise<{ ref: string; eventId: string }> },
) {
  const auth = requireBearerToken(req);

  if (auth.error) {
    return auth.error;
  }

  try {
    const { ref, eventId } = await context.params;
    const upstreamUrl = buildUpstreamUrl(req, `/api/tienda/stores/${ref}/events/${eventId}/rsvps/sync`);
    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('Tienda event RSVP sync proxy error:', error);
    return NextResponse.json(
      { ok: false, message: 'Request failed', status: 500 },
      { status: 500 },
    );
  }
}

export const POST = handler;
export const OPTIONS = preflightResponse;
