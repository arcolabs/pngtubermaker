import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Stripe features are unavailable.",
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead — kept for backward compatibility */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Price IDs from environment
export const STRIPE_PRICE_CREATOR_MONTHLY =
  process.env.STRIPE_PRICE_CREATOR_MONTHLY || "";
export const STRIPE_PRICE_CREATOR_YEARLY =
  process.env.STRIPE_PRICE_CREATOR_YEARLY || "";

// Credit Packs (one-time purchase, never expire)
export const CREDIT_PACKS = {
  starter: { credits: 2_000, priceInCents: 399, displayName: "Starter" },
  popular: { credits: 5_500, priceInCents: 999, displayName: "Popular" },
  best_value: {
    credits: 13_000,
    priceInCents: 1999,
    displayName: "Best Value",
  },
  studio: { credits: 30_000, priceInCents: 3999, displayName: "Studio" },
} as const;

export type CreditPackId = keyof typeof CREDIT_PACKS;

// Creator Pass (optional subscription)
export const CREATOR_PASS = {
  name: "Creator Pass",
  monthlyPrice: 7.99,
  yearlyPrice: 71.88, // $5.99/mo
  monthlyCredits: 6_000,
  monthlyPriceId: STRIPE_PRICE_CREATOR_MONTHLY,
  yearlyPriceId: STRIPE_PRICE_CREATOR_YEARLY,
  features: [
    "6,000 credits/month (best per-credit rate)",
    "HD export (1080p)",
    "All expression packs",
    "Manage subscription anytime",
    "Priority email support",
  ],
} as const;

export type Tier = "free" | "creator";
export type BillingCycle = "monthly" | "yearly";

export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

// Helper to format amount for Stripe (converts dollars to cents)
export function toStripeAmount(amountInDollars: number): number {
  return Math.round(amountInDollars * 100);
}

// Helper to format amount from Stripe (converts cents to dollars)
export function fromStripeAmount(amountInCents: number): number {
  return amountInCents / 100;
}

// Helper to format price for display
export function formatPrice(amountInDollars: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInDollars);
}

// Get price ID for Creator Pass
export function getPriceId(_tier: Tier, cycle: BillingCycle): string {
  return cycle === "monthly"
    ? CREATOR_PASS.monthlyPriceId
    : CREATOR_PASS.yearlyPriceId;
}

// Get yearly savings percentage for Creator Pass
export function getYearlySavings(): number {
  const monthlyCost = CREATOR_PASS.monthlyPrice * 12;
  const savings = monthlyCost - CREATOR_PASS.yearlyPrice;
  return Math.round((savings / monthlyCost) * 100);
}

// Create a Stripe customer
export async function createStripeCustomer(
  email: string,
  name?: string,
): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email,
    name,
  });
}

// Create a checkout session for subscriptions
export async function createSubscriptionCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata,
    },
  });
}

// Create a checkout session for one-time top-up
export async function createTopupCheckoutSession({
  customerId,
  amountInCents,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  customerId: string;
  amountInCents: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Wallet Top-up",
            description: "Add funds to your wallet",
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...metadata,
      type: "topup",
    },
  });
}

// Create customer portal session
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Cancel subscription at period end
export async function cancelSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Reactivate a subscription that was set to cancel
export async function reactivateSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
