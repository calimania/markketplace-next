import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

const ALLOWED_ACTIONS = new Set(['publish', 'unpublish']);

async function handler(
  req: NextRequest,
  context: { params: Promise<{ ref: string; action: string }> },
) {
  const auth = requireBearerToken(req);

  if (auth.error) {
    return auth.error;
  }

  const { ref, action } = await context.params;

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { ok: false, message: 'Invalid action. Allowed: publish, unpublish', status: 400 },
      { status: 400 },
    );
  }

  try {
    const upstreamUrl = buildUpstreamUrl(req, `/api/tienda/stores/${ref}/actions/${action}`);
    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('Tienda store action proxy error:', error);
    return NextResponse.json(
      { ok: false, message: 'Request failed', status: 500 },
      { status: 500 },
    );
  }
}

export const POST = handler;
export const OPTIONS = preflightResponse;
