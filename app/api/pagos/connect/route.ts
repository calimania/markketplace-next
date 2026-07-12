import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

async function handler(req: NextRequest) {
  const auth = requireBearerToken(req);
  if (auth.error) return auth.error;

  const storeRef = req.nextUrl.searchParams.get('storeRef');
  if (!storeRef) {
    return NextResponse.json({ ok: false, message: 'storeRef query param required', status: 400 }, { status: 400 });
  }

  try {
    const upstreamUrl = buildUpstreamUrl(req, '/api/pagos/connect');
    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('[pagos/connect] GET error:', error);
    return NextResponse.json({ ok: false, message: 'Request failed', status: 500 }, { status: 500 });
  }
}

export const GET = handler;
export const OPTIONS = preflightResponse;
