import { Stripe } from  'stripe';

interface StripeInstance {
  instance?: Stripe | null;
  testInstance?: Stripe | null;
}

export { Stripe };

const STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY || '';
// Disabled in production
const STRIPE_TEST_PRIVATE_KEY = process.env.STRIPE_TEST_PRIVATE_KEY || '';

const stripe: StripeInstance & { enabled: () => boolean, start: () => void; getInstance: () => Stripe, getTestInstance: () => Stripe, } = {
  enabled: () => {
    return !!STRIPE_PRIVATE_KEY
  },
  start: () => {
    if (!STRIPE_PRIVATE_KEY) {
      console.error('Stripe secret key is not set in environment variables');
      return null;
    }

    stripe.instance = new Stripe(STRIPE_PRIVATE_KEY);
    return stripe.instance;
  },
  getTestInstance: () => {
    if (!stripe.testInstance) {
      stripe.testInstance = new Stripe(STRIPE_TEST_PRIVATE_KEY);
    }

    return stripe.testInstance as Stripe;
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
