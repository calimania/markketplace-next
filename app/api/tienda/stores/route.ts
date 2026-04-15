import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
  withCors,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

async function handler(req: NextRequest) {
  const auth = requireBearerToken(req);

  if (auth.error) {
    return auth.error;
  }

  try {
    const upstreamUrl = buildUpstreamUrl(req, '/api/tienda/stores');
    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('Tienda stores proxy error:', error);
    return withCors(NextResponse.json(
      { ok: false, message: 'Request failed', status: 500 },
      { status: 500 },
    ));
  }
}

export const GET = handler;
export const OPTIONS = preflightResponse;