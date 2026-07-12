import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ============================================================================
// Auth tables (managed by better-auth)
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ============================================================================
// Credit system
// ============================================================================

export const wallets = pgTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  // Subscription credits: granted monthly, expire at end of billing cycle
  subscriptionCredits: integer("subscription_credits").notNull().default(0),
  subscriptionCreditsExpiresAt: timestamp("subscription_credits_expires_at"),
  // Purchased credits: bought via top-up, never expire
  purchasedCredits: integer("purchased_credits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // 'grant_subscription' | 'grant_purchase' | 'grant_welcome' | 'consume' | 'refund' | 'expire'
    type: text("type").notNull(),
    amount: integer("amount").notNull(), // positive = credit in, negative = credit out
    balanceAfter: integer("balance_after").notNull(), // total balance after this transaction
    description: text("description").notNull(),
    metadata: jsonb("metadata"), // e.g. { avatarId, taskType, stripeSessionId }
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("credit_tx_user_created_idx").on(table.userId, table.createdAt),
  ],
);

// ============================================================================
// Stripe payment records (kept for monetary transaction audit trail)
// ============================================================================

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'topup' | 'payment' | 'refund' | 'subscription'
  status: text("status").notNull(), // 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: text("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  description: text("description"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================================
// Subscriptions
// ============================================================================

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    stripePriceId: text("stripe_price_id").notNull(),
    status: text("status").notNull(), // 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
    tier: text("tier").notNull(), // 'free' | 'creator'
    monthlyCredits: integer("monthly_credits").notNull().default(0),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("sub_user_status_idx").on(table.userId, table.status)],
);

// ============================================================================
// Stripe webhook idempotency
// ============================================================================

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

// ============================================================================
// Avatars & expressions (core product)
// ============================================================================

export const avatars = pgTable(
  "avatars",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("My PNGTuber"),
    slug: text("slug").unique(),
    prompt: text("prompt").notNull(),
    style: text("style").notNull(), // 'anime' | 'chibi' | 'cartoon' | 'pixel-art' | 'none'
    aspectRatio: text("aspect_ratio").default("1:1"), // '1:1' | '3:4' | '9:16'
    status: text("status").notNull(), // 'generating' | 'selecting' | 'completed' | 'failed'
    // Candidate images (4 options from parallel generation, stored as JSON array of URLs)
    candidateImages: jsonb("candidate_images").$type<string[]>(),
    // Upstream that produced each candidate, aligned with candidate_images
    candidateProviders: jsonb("candidate_providers").$type<string[]>(),
    // Selected base image (after user picks one of the 4 candidates)
    baseImageUrl: text("base_image_url"),
    baseImageR2Key: text("base_image_r2_key"),
    // Original base image (before background removal) — used as AI generation input
    // because external AI APIs download this URL and _nobg images can be slow/inaccessible
    originalBaseImageUrl: text("original_base_image_url"),
    originalBaseImageR2Key: text("original_base_image_r2_key"),
    thumbnailUrl: text("thumbnail_url"),
    thumbnailR2Key: text("thumbnail_r2_key"),
    creditsUsed: integer("credits_used").notNull().default(0),
    transactionId: text("transaction_id"), // Links to credit_transactions for audit trail
    metadata: jsonb("metadata"),
    referenceSheetUrl: text("reference_sheet_url"),
    referenceSheetR2Key: text("reference_sheet_r2_key"),
    referenceSheetGeneratedAt: timestamp("reference_sheet_generated_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("avatar_user_status_idx").on(table.userId, table.status),
    index("avatar_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const expressionPacks = pgTable("expression_packs", {
  id: text("id").primaryKey(),
  avatarId: text("avatar_id")
    .notNull()
    .references(() => avatars.id, { onDelete: "cascade" }),
  packType: text("pack_type").notNull(), // 'base' | 'custom'
  subtype: text("subtype"), // 'happy' | 'angry' | 'sad' (null for base)
  status: text("status").notNull(), // 'generating' | 'completed' | 'failed'
  creditsUsed: integer("credits_used").notNull().default(0),
  transactionId: text("transaction_id"), // Links to credit_transactions for audit trail
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const avatarExpressions = pgTable(
  "avatar_expressions",
  {
    id: text("id").primaryKey(),
    avatarId: text("avatar_id")
      .notNull()
      .references(() => avatars.id, { onDelete: "cascade" }),
    packId: text("pack_id").references(() => expressionPacks.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(), // 'idle' | 'talking' | 'happy' | 'sad' | 'angry' | 'surprised'
    status: text("status").notNull(), // 'pending' | 'generating' | 'completed' | 'failed'
    imageUrl: text("image_url"),
    imageR2Key: text("image_r2_key"),
    // Upstream that produced the image (e.g. "byteplus-lite", "piapi-lite", "qwen")
    provider: text("provider"),
    creditsUsed: integer("credits_used").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("expr_avatar_status_idx").on(table.avatarId, table.status)],
);

// ============================================================================
// Partners (link exchange)
// ============================================================================

export const partners = pgTable("partners", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  // Either a logo image URL (uploaded to R2) or raw badge HTML from partner
  logoUrl: text("logo_url"),
  logoR2Key: text("logo_r2_key"),
  badgeHtml: text("badge_html"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// Badges (featured-on badges for homepage footer)
// ============================================================================

export const badges = pgTable("badges", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull(),
  width: integer("width").notNull().default(200),
  height: integer("height").notNull().default(54),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// Type exports
// ============================================================================

// Auth
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;

// Credits
export type Wallet = InferSelectModel<typeof wallets>;
export type NewWallet = InferInsertModel<typeof wallets>;
export type CreditTransaction = InferSelectModel<typeof creditTransactions>;
export type NewCreditTransaction = InferInsertModel<typeof creditTransactions>;

// Payments
export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

// Subscriptions
export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;

// Webhooks
export type WebhookEvent = InferSelectModel<typeof webhookEvents>;
export type NewWebhookEvent = InferInsertModel<typeof webhookEvents>;

// Avatars
export type Avatar = InferSelectModel<typeof avatars>;
export type NewAvatar = InferInsertModel<typeof avatars>;
export type ExpressionPack = InferSelectModel<typeof expressionPacks>;
export type NewExpressionPack = InferInsertModel<typeof expressionPacks>;
export type AvatarExpression = InferSelectModel<typeof avatarExpressions>;
export type NewAvatarExpression = InferInsertModel<typeof avatarExpressions>;

// Partners
export type Partner = InferSelectModel<typeof partners>;
export type NewPartner = InferInsertModel<typeof partners>;

// Badges
export type Badge = InferSelectModel<typeof badges>;
export type NewBadge = InferInsertModel<typeof badges>;
