import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import * as schema from "@/database/schema";
import { getDatabase, isDbConfigured } from "./db";
import { notifyUserSignup } from "./services/lark";

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

// Lazy-initialized auth instance (avoids DB connection at module load / build time)
let _auth: ReturnType<typeof betterAuth> | undefined;

function createAuth() {
  return betterAuth({
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
      trustedProviders: ["google", "discord", "twitch"],
    },
    secret: process.env.BETTER_AUTH_SECRET,
    databaseHooks: {
      account: {
        create: {
          after: async (accountRecord) => {
            // Send Lark notification with OAuth source from the account record directly
            try {
              const db = getDatabase();
              const users = await db
                .select({
                  id: schema.user.id,
                  email: schema.user.email,
                  name: schema.user.name,
                })
                .from(schema.user)
                .where(eq(schema.user.id, accountRecord.userId))
                .limit(1);

              const u = users[0];
              if (u) {
                await notifyUserSignup(
                  { id: u.id, email: u.email, name: u.name },
                  accountRecord.providerId,
                );
              }
            } catch (error) {
              console.error("[Auth] Failed to send Lark notification:", error);
            }
          },
        },
      },
    },
  });
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_, prop) {
    if (!_auth) _auth = createAuth();
    return (_auth as Record<string | symbol, unknown>)[prop];
  },
});

// Backward compatibility
export const getAuth = () => {
  if (!_auth) _auth = createAuth();
  return _auth;
};
