import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/farmday:
 *  summary: Farmday Base Route
 *  description: Fractional farm ownership platform, markket extensions
 *  get:
 *   summary: Healthcheck endpoint
 *   description: Base route for farmday
 *   responses:
 *    200:
 *     description: OK
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
};
