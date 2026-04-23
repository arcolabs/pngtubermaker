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
} from "@/lib/services/credits";
import {
  notifyNewSubscription,
  notifySubscriptionCanceled,
  notifyTopup,
} from "@/lib/services/lark";
import {
  CREATOR_PASS,
  CREDIT_PACKS,
  type CreditPackId,
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
    const tier = (session.metadata?.tier || "creator") as Tier;
    const monthlyCredits = CREATOR_PASS.monthlyCredits;

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
      const price =
        cycle === "yearly"
          ? `$${CREATOR_PASS.yearlyPrice}/yr`
          : `$${CREATOR_PASS.monthlyPrice}/mo`;

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

    // Fail closed on two anomaly classes:
    //   1. Unknown/missing packageId — tampered metadata or legacy session
    //   2. amount_total doesn't match the pack's current priceInCents —
    //      either a pre-lockdown exploit session (attacker paid $X for a
    //      higher-tier pack) or a price-change transition session (legit
    //      user paid old price). Both need human review.
    let anomalyReason: string | null = null;
    if (!packageId || !(packageId in CREDIT_PACKS)) {
      anomalyReason = `unknown packageId=${packageId ?? "none"}`;
    } else {
      const expected = CREDIT_PACKS[packageId as CreditPackId].priceInCents;
      if (amount !== expected) {
        anomalyReason = `amount mismatch: paid=${amount} expected=${expected} packageId=${packageId}`;
      }
    }

    if (anomalyReason) {
      console.error("[webhook] Topup anomaly — credits NOT granted", {
        sessionId: session.id,
        userId,
        amount,
        packageId,
        reason: anomalyReason,
      });

      await db.insert(transactions).values({
        id: crypto.randomUUID(),
        userId,
        type: "topup",
        status: "completed",
        amount: amount.toString(),
        currency: session.currency || "usd",
        description: `ANOMALY: ${anomalyReason} — manual resolution required`,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        metadata: JSON.stringify({
          packageId,
          creditsGranted: 0,
          anomaly: true,
          reason: anomalyReason,
        }),
      });

      const anomalyUser = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (anomalyUser[0]) {
        notifyTopup({
          userId,
          email: anomalyUser[0].email,
          name: anomalyUser[0].name,
          packageName: `⚠️ ANOMALY: ${anomalyReason}`,
          creditsGranted: 0,
          amountPaid: `$${(amount / 100).toFixed(2)}`,
        }).catch(() => {});
      }

      return;
    }

    const pack = CREDIT_PACKS[packageId as CreditPackId];
    const creditsToGrant = pack.credits;

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

    // Notify team via Lark (non-blocking)
    const topupUser = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (topupUser[0]) {
      notifyTopup({
        userId,
        email: topupUser[0].email,
        name: topupUser[0].name,
        packageName:
          CREDIT_PACKS[packageId as CreditPackId].displayName ?? packageId,
        creditsGranted: creditsToGrant,
        amountPaid: `$${(amount / 100).toFixed(2)}`,
      }).catch(() => {}); // fire-and-forget
    }
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

  // Notify Lark when user schedules cancellation (cancel_at_period_end toggled on)
  if (
    subscription.cancel_at_period_end &&
    existingSub[0] &&
    !existingSub[0].cancelAtPeriodEnd
  ) {
    const cancelUser = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, existingSub[0].userId))
      .limit(1);

    if (cancelUser[0]) {
      const cancelDate = subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : undefined;

      notifySubscriptionCanceled({
        userId: existingSub[0].userId,
        email: cancelUser[0].email,
        name: cancelUser[0].name,
        tier: existingSub[0].tier,
        reason: "scheduled",
        cancelAt: cancelDate,
      }).catch(() => {}); // fire-and-forget
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const db = getDatabase();

  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Notify Lark about subscription deletion
  if (existingSub[0]) {
    const cancelUser = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, existingSub[0].userId))
      .limit(1);

    if (cancelUser[0]) {
      notifySubscriptionCanceled({
        userId: existingSub[0].userId,
        email: cancelUser[0].email,
        name: cancelUser[0].name,
        tier: existingSub[0].tier,
        reason: "immediate",
      }).catch(() => {}); // fire-and-forget
    }
  }
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
