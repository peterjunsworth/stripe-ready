// lib/stripeClient.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

export const stripePromise = loadStripe(stripePublicKey);
