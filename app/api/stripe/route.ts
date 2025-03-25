import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripeClient, { Stripe } from '@/markket/stripe.server';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * @swagger POST /api/stripe
 * responses:
 * 200:
 *  description: Webhook received
 *  content:
 *   application/json:
 *    schema:
 *     type: object
 *    properties:
 *      received:
 *       type: boolean
 * @param req
 * @returns
 */
export async function POST(req: NextRequest) {
  console.info('stripe:webhook:');

  const stripe = stripeClient.getInstance();

  try {
    const body = await req.text();
    console.log('Received body:', body);
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !WEBHOOK_SECRET) {
      console.warn('Missing Stripe signature or webhook secret');

      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('🚨 Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }


    // Handle different event types
    console.log(`stripe:webhook:${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data?.object as Stripe.PaymentIntent;
        console.info('Payment succeeded:', paymentIntent.id);
        // Add your payment success logic here
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.warn('Payment failed:', failedPayment.id);
        // Add your payment failure logic here
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to the webhook endpoint
 * Returns a 405 Method Not Allowed response
 * @swagger GET /api/stripe
 * responses:
 *  405:
 *    description: Method Not Allowed
 *   content:
 *     application/json:
 *      schema:
 *        type: object
 *       properties:
 *         error:
 *          type: string
 *         example: Method not allowed
 **/
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

