import { NextRequest, NextResponse } from 'next/server';
import stripeClient from '@/markket/stripe.server';
import { markketConfig } from '@/markket/config';

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

  const body = await req.json();
  const store = body.store;

  const stripe = stripeClient.getInstance();

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe instance not initialized' },
      { status: 500 }
    );
  }

  if (!action || !store) {
    return NextResponse.json(
      { error: 'Missing action parameter' },
      { status: 400 }
    );
  }

  console.info(`stripe:connect:${action}`);

  try {
    switch (action) {
      case 'account': {
        const { test_mode, account_type, account_country } = body;
        const account = await (!!test_mode ? stripeClient.getTestInstance() : stripe).accounts.create({
          type: account_type || 'standard',
          email: userEmail,
          country: account_country || 'US',
        // capabilities: {
        //   transfers: {
        //     requested: true,
        //   },
        // },
        // tos_acceptance: {
        //   service_agreement: 'recipient',
        // },
        });

        console.log('stripe:connect:account:', { account: account?.id, store });

        if (account?.id) {
          const updateStore = await fetch(new URL(`/api/stores/${store}`, markketConfig.api), {
            method: 'PUT',
            body: JSON.stringify({
              data: { STRIPE_CUSTOMER_ID: account?.id, }
            }),
            headers: {
              Authorization: `Bearer ${markketConfig.admin_token}`,
              "Content-Type": "application/json",
            }
          });

          const response = await updateStore.json();

          console.info('stripe:connect:store:update:', {
            ok: updateStore.ok,
            success: response?.data?.STRIPE_CUSTOMER_ID === account?.id,
          });
        }

        return NextResponse.json({ account: account.id });
      }

      case 'account_link': {
        const { account, store, test_mode } = body;
        console.log('stripe:connect:account_link:', { account: account?.account, store });

        if (!account) {
          return NextResponse.json(
            { error: 'Missing account ID in request body' },
            { status: 400 }
          );
        }


        const origin = req.headers.get('origin') || 'http://localhost:4020';

        const accountLink = await (!!test_mode ? stripeClient.getTestInstance() : stripe).accountLinks.create({
          account: account,
          return_url: `${origin}/dashboard/stripe/?store=${store}`,
          refresh_url: `${origin}/dashboard/stripe/?store=${store}`,
          type: "account_onboarding",
        });

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
