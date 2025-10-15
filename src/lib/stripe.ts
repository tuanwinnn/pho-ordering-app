// Import Stripe SDK for server-side operations
import Stripe from 'stripe';

// Import Stripe.js for client-side operations
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Initialize Stripe on the server side
// This will be used in API routes to create payment intents, customers, etc.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover', // Use the latest API version
  typescript: true, // Enable TypeScript support
});

// Cache the Stripe.js instance so we don't load it multiple times
let stripePromise: Promise<StripeJS | null>;

// Load Stripe.js on the client side
// This is used for the checkout form and payment processing in the browser
export const getStripe = () => {
  if (!stripePromise) {
    // Load Stripe with your publishable key (safe to expose in browser)
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};