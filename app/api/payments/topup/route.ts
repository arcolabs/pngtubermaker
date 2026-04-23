import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  CREDIT_PACKS,
  type CreditPackId,
  createStripeCustomer,
  createTopupCheckoutSession,
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

    const body = await req.json().catch(() => null);
    const packageId =
      body && typeof body === "object" && "packageId" in body
        ? (body as { packageId?: unknown }).packageId
        : undefined;

    // Server is the single source of truth for price. Client-supplied
    // `amount` is intentionally ignored: trusting it would let a caller
    // pay for a cheap pack but write a high-tier packageId into metadata,
    // and the webhook (which grants credits based on packageId) would
    // over-credit the account.
    if (typeof packageId !== "string" || !(packageId in CREDIT_PACKS)) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }
    const pack = CREDIT_PACKS[packageId as CreditPackId];

    const db = getDatabase();

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
    const checkoutSession = await createTopupCheckoutSession({
      customerId: stripeCustomerId,
      amountInCents: pack.priceInCents,
      successUrl: `${appUrl}/dashboard?topup=success`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        packageId,
        ...trafficSourceMetadata,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating topup checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
