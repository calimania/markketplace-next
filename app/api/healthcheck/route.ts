import { NextResponse } from 'next/server'
import { version } from '@/package.json';

const MARKKET_STORE_SLUG = process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG;
const MARKKET_API = process.env.NEXT_PUBLIC_MARKKET_API;
const MARKKETPLACE_URL = process.env.NEXT_PUBLIC_MARKKETPLACE_URL;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

/**
 * @swagger
 * /api/healthcheck:
 *  summary: Healthcheck
 *  description: Healthcheck endpoint for the Markket Next.js application
 *  get:
 *   summary: Healthcheck endpoint
 *   description: Healthcheck endpoint for the Markket Next.js application
 *   responses:
 *    200:
 *     description: OK
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version,
      env: {
        store_slug: MARKKET_STORE_SLUG,
        api: MARKKET_API,
        marketplace_url: MARKKETPLACE_URL,
        posthog_key: POSTHOG_KEY?.slice(0, 4),
        posthog_host: POSTHOG_HOST,
      }
    },
    { status: 200 }
  )
}
