import { NextRequest, NextResponse } from 'next/server';
import {
  buildUpstreamUrl,
  preflightResponse,
  proxyToUpstream,
  requireBearerToken,
} from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

const ALLOWED_ACTIONS = new Set(['onboarding', 'resume', 'review-link', 'dashboard-link']);

async function handler(
  req: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const auth = requireBearerToken(req);
  if (auth.error) return auth.error;

  const { action } = await context.params;

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { ok: false, message: `Invalid action. Allowed: ${[...ALLOWED_ACTIONS].join(', ')}`, status: 400 },
      { status: 400 },
    );
  }

  const storeRef = req.nextUrl.searchParams.get('storeRef');
  if (!storeRef) {
    return NextResponse.json({ ok: false, message: 'storeRef query param required', status: 400 }, { status: 400 });
  }

  try {
    const upstreamUrl = buildUpstreamUrl(req, `/api/pagos/connect/${action}`);
    return await proxyToUpstream(req, upstreamUrl, auth.token);
  } catch (error) {
    console.error(`[pagos/connect/${action}] POST error:`, error);
    return NextResponse.json({ ok: false, message: 'Request failed', status: 500 }, { status: 500 });
  }
}

export const POST = handler;
export const OPTIONS = preflightResponse;
