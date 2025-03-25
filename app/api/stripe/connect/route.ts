import { NextRequest, NextResponse } from 'next/server';
import stripeClient from '@/markket/stripe.server';

/**
 * @swagger POST /api/stripe/connect
 *  description: Create a Stripe account or account link,
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

  /* middleware prevents this from being null */
  const userEmail = req.headers.get('x-user-email') as string;

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

  console.info(`stripe:connect:${action}`);

  try {
    switch (action) {
      case 'account': {
        const account = await stripe.accounts.create({
          type: 'standard',
          email: userEmail
        });

        console.log('stripe:connect:account:', { account: account?.id });
        return NextResponse.json({ account: account.id });
      }

      case 'account_link': {
        const body = await req.json();
        const { account, store } = body;
        console.log('stripe:connect:account_link:', { account });

        if (!account) {
          return NextResponse.json(
            { error: 'Missing account ID in request body' },
            { status: 400 }
          );
        }

        const origin = req.headers.get('origin') || 'http://localhost:4020';

        const accountLink = await stripe.accountLinks.create({
          account: account,
          return_url: `${origin}/dashboard/stripe/?store=${store}`,
          refresh_url: `${origin}/dashboard/stripe/?store=${store}`,
          type: "account_onboarding",
        });

        console.log({ accountLink });

        return NextResponse.json({
          url: accountLink.url,
        });
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
