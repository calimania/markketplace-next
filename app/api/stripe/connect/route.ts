import { NextRequest, NextResponse } from 'next/server';
import stripeClient from '@/markket/stripe';

/**
 * @swagger POST /api/stripe/connect
 *  description: Create a Stripe account or account link
 *   responses:
 *    400:
 *     description: Bad request
 *    500:
 *     description: Internal server error
 * @param req
 * @returns
 **/
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  const stripe = stripeClient.getInstance();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe instance not initialized' },
      { status: 500 }
    );
  }

  if (!action) {
    return NextResponse.json(
      { error: 'Missing action parameter' },
      { status: 400 }
    );
  }

  try {
    switch (action) {
      case 'account': {
        const account = await stripe.accounts.create({
          controller: {
            stripe_dashboard: {
              type: "express",
            },
            fees: {
              payer: "application"
            },
            losses: {
              payments: "application"
            },
          },
        });

        return NextResponse.json({ account: account.id });
      }

      case 'account_link': {
        const body = await req.json();
        const { account } = body;

        if (!account) {
          return NextResponse.json(
            { error: 'Missing account ID in request body' },
            { status: 400 }
          );
        }

        const origin = req.headers.get('origin') || 'http://localhost:4020';

        const accountLink = await stripe.accountLinks.create({
          account: account,
          return_url: `${origin}/return/${account}`,
          refresh_url: `${origin}/refresh/${account}`,
          type: "account_onboarding",
        });

        return NextResponse.json(accountLink);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Stripe Connect API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger GET /api/stripe/connect
 *   responses:
 *    405:
 *     description: Method not allowed
 * @returns
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}