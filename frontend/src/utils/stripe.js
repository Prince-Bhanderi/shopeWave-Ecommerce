import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const isStripeEnabled = Boolean(publishableKey);

let stripePromise;
export const getStripePromise = () => {
  if (!isStripeEnabled) return null;
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
};
