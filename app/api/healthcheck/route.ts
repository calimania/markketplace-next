import { NextResponse } from 'next/server'

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
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}
