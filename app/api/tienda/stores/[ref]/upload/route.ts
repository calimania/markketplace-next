import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
  withCors,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

async function handler(req: NextRequest, context: { params: Promise<{ ref: string }> }) {
  const auth = requireBearerToken(req);

  if (auth.error) {
    return auth.error;
  }

  try {
    const { ref } = await context.params;
    console.log(`[uploadRoute] ref: ${ref}, content-type: ${req.headers.get('content-type')}`);

    const upstreamUrl = buildUpstreamUrl(req, `/api/tienda/stores/${ref}/upload`);
    console.log(`[uploadRoute] forwarding to ${upstreamUrl.toString()}`);

    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('Tienda upload proxy error:', error);
    return withCors(NextResponse.json(
      { ok: false, message: 'Request failed', status: 500 },
      { status: 500 },
    ));
  }
}

export const POST = handler;
export const OPTIONS = preflightResponse;
