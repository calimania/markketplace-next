import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
  validateContentType,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

async function handler(
  req: NextRequest,
  context: { params: Promise<{ ref: string; contentType: string; itemId: string }> },
) {
  const auth = requireBearerToken(req);

  if (auth.error) {
    return auth.error;
  }

  try {
    const { ref, contentType, itemId } = await context.params;
    const invalidTypeResponse = validateContentType(contentType);

    if (invalidTypeResponse) {
      return invalidTypeResponse;
    }

    const upstreamUrl = buildUpstreamUrl(req, `/api/tienda/stores/${ref}/content/${contentType}/${itemId}`);

    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error('Tienda proxy error:', error);
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
