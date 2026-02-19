import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/database/schema";
import { getDatabase, isDbConfigured } from "./db";
import { grantPurchasedCredits } from "./services/credits";

// Validate environment variables
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const requiredEnvVars = {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

// Log missing env vars in development
if (process.env.NODE_ENV === "development") {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn("[Auth] Missing environment variables:", missing);
  }

  if (!isDbConfigured()) {
    console.warn("[Auth] DATABASE_URL is not set");
  }
}

// Environment variables for welcome credits
const WELCOME_CREDITS = Number.parseInt(
  process.env.WELCOME_CREDITS || "500",
  10,
);
const WELCOME_CREDITS_EXPIRY_DAYS = Number.parseInt(
  process.env.WELCOME_CREDITS_EXPIRY_DAYS || "30",
  10,
);

export const auth = betterAuth({
  database: drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema,
  }),
  baseURL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID || "",
      clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
    },
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github", "discord", "twitch"],
  },
  secret: process.env.BETTER_AUTH_SECRET,
  events: {
    async onUserCreated(user: {
      id: string;
      email: string;
      name?: string | null;
    }) {
      try {
        // Calculate expiry date (30 days from now by default)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + WELCOME_CREDITS_EXPIRY_DAYS);

        // Grant welcome credits with expiration
        await grantPurchasedCredits(
          user.id,
          WELCOME_CREDITS,
          "Welcome bonus",
          { source: "signup", expiresInDays: WELCOME_CREDITS_EXPIRY_DAYS },
          expiresAt,
        );

        console.log(
          `[Auth] Granted ${WELCOME_CREDITS} welcome credits to user ${user.id} (expires: ${expiresAt.toISOString()})`,
        );
      } catch (error) {
        console.error("[Auth] Failed to grant welcome credits:", error);
        // Don't throw - we don't want to block user creation if credits fail
      }
    },
  },
});

// Backward compatibility
export const getAuth = () => auth;
