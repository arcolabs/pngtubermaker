import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { subscriptions, user } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  type BillingCycle,
  createStripeCustomer,
  createSubscriptionCheckoutSession,
  getPriceId,
  type Tier,
} from "@/lib/stripe";
import { getTrafficSourceMetadata } from "@/lib/traffic-source";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier, cycle = "monthly" } = await req.json();

    if (tier !== "creator") {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'creator'" },
        { status: 400 },
      );
    }

    if (!["monthly", "yearly"].includes(cycle)) {
      return NextResponse.json(
        { error: "Invalid cycle. Must be 'monthly' or 'yearly'" },
        { status: 400 },
      );
    }

    const db = getDatabase();

    // Check if user already has an active subscription
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id))
      .limit(1);

    if (existingSub.length > 0 && existingSub[0]?.status === "active") {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 },
      );
    }

    const priceId = getPriceId(tier as Tier, cycle as BillingCycle);

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for ${tier} ${cycle}` },
        { status: 500 },
      );
    }

    // Get or create Stripe customer, persisted on user record
    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    let stripeCustomerId: string = userRecord[0]?.stripeCustomerId ?? "";

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        session.user.email,
        session.user.name || undefined,
      );
      stripeCustomerId = customer.id;

      await db
        .update(user)
        .set({ stripeCustomerId: customer.id })
        .where(eq(user.id, session.user.id));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const trafficSourceMetadata = getTrafficSourceMetadata({
      _ts_sid: req.cookies.get("_ts_sid")?.value,
      _ts_vid: req.cookies.get("_ts_vid")?.value,
    });
    const checkoutSession = await createSubscriptionCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: `${appUrl}/pricing?success=true`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        tier,
        cycle,
        ...trafficSourceMetadata,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating subscription checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
