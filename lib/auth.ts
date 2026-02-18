import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/database/schema";
import { getDatabase, isDbConfigured } from "./db";

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
});

// Backward compatibility
export const getAuth = () => auth;
