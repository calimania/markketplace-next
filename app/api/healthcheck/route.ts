import { NextResponse } from 'next/server'
import { apiConfig } from '../config';

export const { dynamic, runtime } = apiConfig;

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}
