import { Stripe } from  'stripe';

interface StripeInstance {
  instance?: Stripe | null;
}

export { Stripe };

const STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY || '';

const stripe: StripeInstance & { start: () => void; getInstance: () => Stripe } = {
  start: () => {
    if (!STRIPE_PRIVATE_KEY) {
      console.error('Stripe secret key is not set in environment variables');
      return null;
    }

    stripe.instance = new Stripe(STRIPE_PRIVATE_KEY);
    return stripe.instance;
  },
  getInstance: () => {
    if (!stripe.instance) {
      stripe.instance = stripe.start() as any as Stripe;
    }

    if (!stripe.instance) {
      throw new Error('Stripe instance could not be initialized');
    }
    return stripe.instance;
  }
}

export default stripe;
