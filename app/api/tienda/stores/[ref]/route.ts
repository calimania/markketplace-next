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
  context: { params: Promise<{ ref: string }> },
) {
  const auth = requireBearerToken(req);

  if (auth.error) {
    return auth.error;
  }

  const { ref } = await context.params;

  try {
    const upstreamUrl = buildUpstreamUrl(req, `/api/tienda/stores/${ref}`);
    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('Tienda store proxy error:', error);
    return NextResponse.json(
      { ok: false, message: 'Request failed', status: 500 },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = preflightResponse;
