import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/database/schema";
import { getDatabase } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema,
  }),
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github"],
  },
  secret: process.env.BETTER_AUTH_SECRET,
});

// Backward compatibility
export const getAuth = () => auth;
