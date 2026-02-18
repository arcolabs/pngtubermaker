import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { user } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { createStripeCustomer, createTopupCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 500 || amount > 100000) {
      return NextResponse.json(
        { error: "Invalid amount. Must be between $5 and $1000 (in cents)" },
        { status: 400 },
      );
    }

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
    const checkoutSession = await createTopupCheckoutSession({
      customerId: stripeCustomerId,
      amountInCents: amount,
      successUrl: `${appUrl}/wallet?success=true`,
      cancelUrl: `${appUrl}/wallet?canceled=true`,
      metadata: {
        userId: session.user.id,
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
