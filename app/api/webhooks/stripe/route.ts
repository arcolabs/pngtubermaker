import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  type Subscription,
  subscriptions,
  transactions,
  wallets,
  webhookEvents,
} from "@/database/schema";
import { getDatabase } from "@/lib/db";
import { STRIPE_WEBHOOK_SECRET, stripe } from "@/lib/stripe";

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
        tier: (session.metadata?.tier || "pro") as "basic" | "pro",
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    }
  }

  // Handle top-up checkout
  if (session.mode === "payment" && session.metadata?.type === "topup") {
    const amount = session.amount_total || 0;

    await db.insert(transactions).values({
      id: crypto.randomUUID(),
      userId,
      type: "topup",
      status: "completed",
      amount: amount.toString(),
      currency: session.currency || "usd",
      description: "Wallet top-up",
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      metadata: JSON.stringify({ sessionId: session.id }),
    });

    // Atomic balance update using SQL increment
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (existingWallet.length > 0 && existingWallet[0]) {
      await db
        .update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.id, existingWallet[0].id));
    } else {
      await db.insert(wallets).values({
        id: crypto.randomUUID(),
        userId,
        balance: amount,
        currency: session.currency || "usd",
      });
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const db = getDatabase();
  const period = getSubscriptionPeriod(subscription);

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
