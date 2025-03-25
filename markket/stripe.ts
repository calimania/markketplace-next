import { Stripe } from  'stripe';

interface StripeInstance {
  instance?: Stripe | null;
}

const stripe: StripeInstance & { start: () => void; getInstance: () => Stripe } = {
  start: () => {
    stripe.instance = new Stripe(process.env.STRIPE_SECRET_KEY || '');
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
