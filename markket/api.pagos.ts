'use client';

/**
 * Typed client for Stripe Connect endpoints proxied through /api/pagos/connect.
 *
 * Security notes (from pre-implementation review):
 *   - All requests require a valid JWT (passed via Authorization header from the
 *     token stored in localStorage — same pattern as tiendaClient).
 *   - refreshUrl / returnUrl in onboarding bodies are built from the current
 *     window.location.origin so they are always same-origin (no open-redirect risk).
 *   - stripe_test flag is only passed when explicitly set; the server falls
 *     back to live keys in production, fail-closed (see server-side notes).
 *   - redirect_url in dashboard-link responses is treated as a client-side
 *     informational value only — Stripe does not use it for automatic redirection.
 */

import { readTiendaAuthToken } from '@/app/tienda/[storeSlug]/content.find';

// ─── Response shapes (matching server contract) ────────────────────────────

export interface StripeConnectData {
  account_id?: string;
  onboarding_completed?: boolean;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements_due?: string[];
  requirements_past_due?: string[];
  disabled_reason?: string | null;
  /** Canonical status derived server-side */
  status: 'not_connected' | 'pending' | 'restricted' | 'active';
  source?: string;
  last_synced_at?: string;
}

export interface StripeConnectStatusResponse {
  ok: boolean;
  data?: {
    store: { documentId: string; slug: string; title?: string };
    stripe_connect?: StripeConnectData;
    integrations?: { required?: string[] };
    reason?: string | null;
  };
  message?: string;
}

export interface StripeOnboardingResponse {
  ok: boolean;
  action?: string;
  data?: {
    account_id?: string;
    created_account?: boolean;
    link_type?: string;
    url?: string;
    expires_at?: string;
    refresh_url?: string;
    return_url?: string;
    dashboard_url?: string;
    status?: StripeConnectData;
  };
  message?: string;
}

export interface StripeDashboardLinkResponse {
  ok: boolean;
  action?: string;
  data?: {
    account_id?: string;
    url?: string;
    created?: string;
    /** Treat as client-side informational value only — Stripe does not redirect here automatically */
    redirect_url?: string;
  };
  message?: string;
}

// ─── Base fetch helper ────────────────────────────────────────────────────

function pagosHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function buildPagosUrl(path: string, storeRef: string, stripeTest?: boolean): string {
  const params = new URLSearchParams({ storeRef });
  if (stripeTest !== undefined) params.set('stripe_test', String(stripeTest));
  return `/api/pagos/connect${path}?${params.toString()}`;
}

async function pagosPost<T>(
  path: string,
  storeRef: string,
  body: Record<string, unknown>,
  stripeTest?: boolean,
): Promise<T> {
  const token = readTiendaAuthToken();
  const url = buildPagosUrl(path, storeRef, stripeTest);
  const res = await fetch(url, {
    method: 'POST',
    headers: pagosHeaders(token),
    body: JSON.stringify({ data: body }),
  });
  return res.json() as Promise<T>;
}

async function pagosGet<T>(storeRef: string, stripeTest?: boolean): Promise<T> {
  const token = readTiendaAuthToken();
  const url = buildPagosUrl('', storeRef, stripeTest);
  const res = await fetch(url, {
    method: 'GET',
    headers: pagosHeaders(token),
    cache: 'no-store',
  });
  return res.json() as Promise<T>;
}

// ─── Typed API functions ──────────────────────────────────────────────────

/**
 * A. GET /api/pagos/connect — fetch current Stripe Connect status for a store.
 */
export async function getConnectStatus(
  storeRef: string,
  stripeTest?: boolean,
): Promise<StripeConnectStatusResponse> {
  return pagosGet<StripeConnectStatusResponse>(storeRef, stripeTest);
}

/**
 * B. POST /api/pagos/connect/onboarding — start or create a Stripe Connect account
 * and get an onboarding link. Redirects merchant to data.url.
 * refreshUrl/returnUrl default to same-origin dashboard paths.
 */
export async function startOnboarding(
  storeRef: string,
  country = 'US',
  stripeTest?: boolean,
): Promise<StripeOnboardingResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return pagosPost<StripeOnboardingResponse>(
    '/onboarding',
    storeRef,
    {
      refreshUrl: `${origin}/tienda/${storeRef}/payouts`,
      returnUrl: `${origin}/tienda/${storeRef}/payouts?stripe=return`,
      country,
    },
    stripeTest,
  );
}

/**
 * C. POST /api/pagos/connect/resume — regenerate an onboarding link for an
 * existing but incomplete account.
 */
export async function resumeOnboarding(
  storeRef: string,
  stripeTest?: boolean,
): Promise<StripeOnboardingResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return pagosPost<StripeOnboardingResponse>(
    '/resume',
    storeRef,
    {
      refreshUrl: `${origin}/tienda/${storeRef}/payouts`,
      returnUrl: `${origin}/tienda/${storeRef}/payouts?stripe=return`,
    },
    stripeTest,
  );
}

/**
 * D. POST /api/pagos/connect/review-link — KYC fix / account update link.
 */
export async function getReviewLink(
  storeRef: string,
  stripeTest?: boolean,
): Promise<StripeOnboardingResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return pagosPost<StripeOnboardingResponse>(
    '/review-link',
    storeRef,
    {
      refreshUrl: `${origin}/tienda/${storeRef}/payouts`,
      returnUrl: `${origin}/tienda/${storeRef}/payouts?stripe=return`,
    },
    stripeTest,
  );
}

/**
 * E. POST /api/pagos/connect/dashboard-link — Express dashboard login link.
 * Redirect merchant to data.url. Note: redirect_url in the response is
 * informational only — Stripe does not use it for automatic redirects.
 */
export async function getDashboardLink(
  storeRef: string,
  stripeTest?: boolean,
): Promise<StripeDashboardLinkResponse> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return pagosPost<StripeDashboardLinkResponse>(
    '/dashboard-link',
    storeRef,
    {
      returnUrl: `${origin}/tienda/${storeRef}/payouts`,
    },
    stripeTest,
  );
}

// ─── React hook ──────────────────────────────────────────────────────────

export type ConnectState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'loaded'; connectData: StripeConnectData }
  | { phase: 'error'; message: string };

import { useCallback, useEffect, useState } from 'react';

export function useStripeConnect(storeRef: string, stripeTest?: boolean) {
  const [state, setState] = useState<ConnectState>({ phase: 'idle' });
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setState({ phase: 'loading' });
    try {
      const res = await getConnectStatus(storeRef, stripeTest);
      const connectData = res?.data?.stripe_connect;
      if (res.ok && connectData) {
        setState({ phase: 'loaded', connectData });
      } else {
        // no account yet — surface as not_connected
        setState({
          phase: 'loaded',
          connectData: { status: 'not_connected' },
        });
      }
    } catch (err) {
      setState({ phase: 'error', message: err instanceof Error ? err.message : 'Could not load Stripe status.' });
    }
  }, [storeRef, stripeTest]);

  useEffect(() => {
    if (storeRef) load();
  }, [storeRef, load]);

  const connectStatus =
    state.phase === 'loaded' ? state.connectData.status : undefined;

  const handleStart = useCallback(async (country = 'US') => {
    setActionLoading(true);
    try {
      const res = await startOnboarding(storeRef, country, stripeTest);
      if (res?.data?.url) window.location.href = res.data.url;
      else throw new Error(res.message || 'No onboarding URL returned');
    } finally {
      setActionLoading(false);
    }
  }, [storeRef, stripeTest]);

  const handleResume = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await resumeOnboarding(storeRef, stripeTest);
      if (res?.data?.url) window.location.href = res.data.url;
      else throw new Error(res.message || 'No resume URL returned');
    } finally {
      setActionLoading(false);
    }
  }, [storeRef, stripeTest]);

  const handleReview = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await getReviewLink(storeRef, stripeTest);
      if (res?.data?.url) window.location.href = res.data.url;
      else throw new Error(res.message || 'No review URL returned');
    } finally {
      setActionLoading(false);
    }
  }, [storeRef, stripeTest]);

  const handleDashboard = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await getDashboardLink(storeRef, stripeTest);
      if (res?.data?.url) {
        // Open in new tab — Stripe Express dashboard
        window.open(res.data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error(res.message || 'No dashboard URL returned');
      }
    } finally {
      setActionLoading(false);
    }
  }, [storeRef, stripeTest]);

  return {
    state,
    connectStatus,
    actionLoading,
    load,
    handleStart,
    handleResume,
    handleReview,
    handleDashboard,
  };
}
