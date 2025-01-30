import { NextResponse } from 'next/server'
import { apiConfig } from './config';

export const { dynamic, runtime } = apiConfig;

export async function GET() {
  return NextResponse.json(
    {
      markket: 'markket',
      markket_url: process.env.MARKKET_URL,
      markket_store_slug: process.env.MARKKET_STORE_SLUG,
      ok: true,
    },
    { status: 200 }
  )
}
