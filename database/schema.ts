import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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

// 图片资源表
export const images = pgTable("images", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'thumbnail' | 'upload' | 'avatar'
  filename: text("filename").notNull(),
  originalName: text("original_name"),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(), // bytes
  width: text("width"),
  height: text("height"),
  r2Key: text("r2_key").notNull(), // R2 中的路径
  r2Url: text("r2_url").notNull(), // 公开访问 URL
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 类型导出
export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;
export type Image = InferSelectModel<typeof images>;
export type NewImage = InferInsertModel<typeof images>;
export type GeneratedThumbnail = InferSelectModel<typeof generatedThumbnails>;
export type NewGeneratedThumbnail = InferInsertModel<
  typeof generatedThumbnails
>;

// 用户钱包余额表
export const wallets = pgTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  balance: integer("balance").notNull().default(0), // 余额（分），使用 integer 以支持原子 SQL 运算
  currency: text("currency").notNull().default("usd"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Wallet = InferSelectModel<typeof wallets>;
export type NewWallet = InferInsertModel<typeof wallets>;

// 交易记录表（充值、消费等）
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'topup' | 'payment' | 'refund' | 'subscription'
  status: text("status").notNull(), // 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: text("amount").notNull(), // 金额（分，正数为充值，负数为消费）
  currency: text("currency").notNull().default("usd"),
  description: text("description"), // 交易描述
  stripeSessionId: text("stripe_session_id"), // Stripe checkout session ID
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Stripe payment intent ID
  metadata: text("metadata"), // JSON 存储额外信息
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

// 订阅表
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: text("status").notNull(), // 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  tier: text("tier").notNull(), // 'basic' | 'pro'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;

// Stripe Webhook 幂等性记录表
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(), // Stripe event ID (evt_xxx)
  type: text("type").notNull(), // event type (e.g. checkout.session.completed)
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export type WebhookEvent = InferSelectModel<typeof webhookEvents>;
export type NewWebhookEvent = InferInsertModel<typeof webhookEvents>;

// 缩略图生成记录
export const generatedThumbnails = pgTable("generated_thumbnails", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sourceImageId: text("source_image_id").references(() => images.id),
  prompt: text("prompt"), // AI 提示词
  resultImageId: text("result_image_id").references(() => images.id),
  status: text("status").notNull(), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
