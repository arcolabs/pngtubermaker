import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/database/schema";

// Neon serverless defaults webSocketConstructor to undefined.
// On Node.js 22+ use native WebSocket; fall back to ws package.
neonConfig.webSocketConstructor =
  globalThis.WebSocket ??
  (() => {
    const load = new Function("m", "return require(m)");
    return load("ws");
  })();

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  if (!db) {
    db = drizzle({ client: pool, schema });
  }
  return db;
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
