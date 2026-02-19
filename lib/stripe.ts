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
export const STRIPE_PRICE_BASIC_MONTHLY =
  process.env.STRIPE_PRICE_BASIC_MONTHLY || "";
export const STRIPE_PRICE_BASIC_YEARLY =
  process.env.STRIPE_PRICE_BASIC_YEARLY || "";
export const STRIPE_PRICE_PRO_MONTHLY =
  process.env.STRIPE_PRICE_PRO_MONTHLY || "";
export const STRIPE_PRICE_PRO_YEARLY =
  process.env.STRIPE_PRICE_PRO_YEARLY || "";

// Pricing configuration (credit-based model)
export const PRICING_CONFIG = {
  free: {
    name: "Free",
    description: "Perfect for trying out PNGTuberMaker",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyCredits: 0,
    monthlyPriceId: "",
    yearlyPriceId: "",
    features: [
      "500 welcome credits",
      "Basic avatar generation",
      "512px export",
      "PNGTuber watermark",
      "Community support",
    ],
    highlighted: false,
  },
  start: {
    name: "Start",
    description: "For casual streamers and hobbyists",
    monthlyPrice: 9,
    yearlyPrice: 86.4, // 20% savings
    monthlyCredits: 12_000,
    monthlyPriceId: STRIPE_PRICE_BASIC_MONTHLY,
    yearlyPriceId: STRIPE_PRICE_BASIC_YEARLY,
    features: [
      "12,000 credits/month ($12 value)",
      "HD export (1080p)",
      "No watermark",
      "Basic expression pack",
      "Standard generation queue",
      "Email support",
    ],
    highlighted: false,
  },
  pro: {
    name: "Pro",
    description: "For serious streamers and content creators",
    monthlyPrice: 30,
    yearlyPrice: 288, // 20% savings
    monthlyCredits: 50_000,
    monthlyPriceId: STRIPE_PRICE_PRO_MONTHLY,
    yearlyPriceId: STRIPE_PRICE_PRO_YEARLY,
    features: [
      "50,000 credits/month ($50 value)",
      "4K export (2160p)",
      "No watermark",
      "All expressions & animations",
      "Priority generation queue",
      "Full commercial license",
      "Access to avatar library",
      "Priority email support",
    ],
    highlighted: true,
  },
};

export type Tier = "free" | "start" | "pro";
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

// Get price ID for tier and cycle
export function getPriceId(tier: Tier, cycle: BillingCycle): string {
  const config = PRICING_CONFIG[tier];
  return cycle === "monthly" ? config.monthlyPriceId : config.yearlyPriceId;
}

// Get savings percentage
export function getYearlySavings(tier: Tier): number {
  const config = PRICING_CONFIG[tier];
  const monthlyCost = config.monthlyPrice * 12;
  const savings = monthlyCost - config.yearlyPrice;
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
    payment_method_types: ["card"],
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
    payment_method_types: ["card"],
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
