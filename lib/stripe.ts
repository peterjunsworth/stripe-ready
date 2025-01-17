// lib/stripe.ts
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Create and export a single instance of Stripe
export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-11-20.acacia', // Use the latest stable API version
});
