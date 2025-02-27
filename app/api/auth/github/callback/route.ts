import { NextResponse } from 'next/server';
import PostHog  from '@/app/utils/posthog';
import { randomUUID } from 'node:crypto';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const posthog = PostHog();

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const STRAPI_URL = process.env.NEXT_PUBLIC_MARKKET_API;

    if (!code) {
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }

    const tokenResponse = await fetch(`${STRAPI_URL}/api/auth/github/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await tokenResponse.json();

    if (!data.jwt || !data.user) {
      return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url));
    }

    return NextResponse.redirect(new URL(`auth?jwt=${data.jwt}`, request.url));
  } catch (error) {
    console.error('GitHub callback error:', error);

    posthog?.capture({
      event: 'auth.github.failed',
      distinctId: randomUUID(),
      properties: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return NextResponse.redirect(new URL('/auth?error=unknown', request.url));
  }
};
