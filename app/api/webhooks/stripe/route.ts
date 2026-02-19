import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  type Subscription,
  subscriptions,
  transactions,
  user,
  webhookEvents,
} from "@/database/schema";
import { getDatabase } from "@/lib/db";
import {
  grantPurchasedCredits,
  grantSubscriptionCredits,
  TOPUP_PACKAGES,
} from "@/lib/services/credits";
import { notifyNewSubscription } from "@/lib/services/lark";
import {
  PRICING_CONFIG,
  STRIPE_WEBHOOK_SECRET,
  stripe,
  type Tier,
} from "@/lib/stripe";

// In Stripe SDK v20+, current_period_start/end moved to SubscriptionItem
function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    start: item ? new Date(item.current_period_start * 1000) : new Date(),
    end: item ? new Date(item.current_period_end * 1000) : new Date(),
  };
}

async function isEventProcessed(eventId: string): Promise<boolean> {
  const db = getDatabase();
  const existing = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, eventId))
    .limit(1);
  return existing.length > 0;
}

async function markEventProcessed(
  eventId: string,
  eventType: string,
): Promise<void> {
  const db = getDatabase();
  await db
    .insert(webhookEvents)
    .values({ id: eventId, type: eventType })
    .onConflictDoNothing();
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const db = getDatabase();
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Check if this specific payment was already processed via transaction record
  if (paymentIntentId) {
    const existing = await db
      .select()
      .from(transactions)
      .where(eq(transactions.stripePaymentIntentId, paymentIntentId))
      .limit(1);

    if (existing.length > 0) {
      console.log("Transaction already processed:", existing[0]?.id);
      return;
    }
  }

  // Handle subscription checkout
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const tier = (session.metadata?.tier || "pro") as Tier;
    const tierConfig = PRICING_CONFIG[tier];
    const monthlyCredits = tierConfig?.monthlyCredits ?? 0;

    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
      .limit(1);

    const period = getSubscriptionPeriod(subscription);

    if (existingSub.length > 0) {
      await db
        .update(subscriptions)
        .set({
          status: subscription.status as Subscription["status"],
          stripePriceId: subscription.items.data[0]?.price.id || "",
          tier,
          monthlyCredits,
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSub[0]?.id ?? ""));
    } else {
      await db.insert(subscriptions).values({
        id: crypto.randomUUID(),
        userId,
        stripeCustomerId: (typeof session.customer === "string"
          ? session.customer
          : session.customer?.id) as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id || "",
        status: subscription.status as Subscription["status"],
        tier,
        monthlyCredits,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    }

    // Grant subscription credits for this billing cycle
    if (monthlyCredits > 0) {
      await grantSubscriptionCredits(userId, monthlyCredits, period.end);
    }

    // Notify team via Lark (non-blocking)
    const userRecord = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userRecord[0]) {
      const cycle = session.metadata?.cycle || "monthly";
      const price = tierConfig
        ? cycle === "yearly"
          ? `$${tierConfig.yearlyPrice}/yr`
          : `$${tierConfig.monthlyPrice}/mo`
        : "N/A";

      notifyNewSubscription({
        userId,
        email: userRecord[0].email,
        name: userRecord[0].name,
        tier,
        cycle,
        monthlyCredits,
        amount: price,
      }).catch(() => {}); // fire-and-forget
    }
  }

  // Handle top-up checkout (credit package purchase)
  if (session.mode === "payment" && session.metadata?.type === "topup") {
    const amount = session.amount_total || 0;
    const packageId = session.metadata?.packageId;

    // Calculate credits to grant
    let creditsToGrant = 0;
    if (packageId && packageId in TOPUP_PACKAGES) {
      const pkg = TOPUP_PACKAGES[packageId as keyof typeof TOPUP_PACKAGES];
      creditsToGrant = pkg.credits + pkg.bonusCredits;
    } else {
      // Fallback: 1000 credits per $1 (amount is in cents)
      creditsToGrant = Math.floor(amount / 100) * 1000;
    }

    // Log the monetary transaction
    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "topup",
      status: "completed",
      amount: amount.toString(),
      currency: session.currency || "usd",
      description: `Credit top-up: ${creditsToGrant} credits`,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      metadata: JSON.stringify({ packageId, creditsGranted: creditsToGrant }),
    });

    // Grant purchased credits (never expire)
    await grantPurchasedCredits(
      userId,
      creditsToGrant,
      `Credit top-up: ${creditsToGrant} credits`,
      { stripeSessionId: session.id, packageId },
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const db = getDatabase();
  const period = getSubscriptionPeriod(subscription);

  // Find existing subscription to get tier info
  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  await db
    .update(subscriptions)
    .set({
      status: subscription.status as Subscription["status"],
      stripePriceId: subscription.items.data[0]?.price.id || "",
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // On renewal (status active + period changed), grant new credits
  if (
    subscription.status === "active" &&
    existingSub[0]?.monthlyCredits &&
    existingSub[0].monthlyCredits > 0
  ) {
    const currentEnd = existingSub[0].currentPeriodEnd;
    const newEnd = period.end;
    // Only grant if the period actually changed (renewal, not just update)
    if (!currentEnd || newEnd.getTime() !== currentEnd.getTime()) {
      await grantSubscriptionCredits(
        existingSub[0].userId,
        existingSub[0].monthlyCredits,
        period.end,
      );
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = getDatabase();

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const db = getDatabase();

  await db
    .update(transactions)
    .set({
      status: "failed",
    })
    .where(eq(transactions.stripePaymentIntentId, paymentIntent.id));
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 },
    );
  }

  // Database-backed idempotency check
  if (await isEventProcessed(event.id)) {
    console.log("Event already processed:", event.id);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await markEventProcessed(event.id, event.type);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
