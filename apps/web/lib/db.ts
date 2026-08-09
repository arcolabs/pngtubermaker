import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/database/schema";

// Plain node-postgres pool — works against any PostgreSQL (Neon, self-hosted, RDS).
// sslmode=require in the URL encrypts without CA verification (psql semantics),
// which is what the self-hosted db-frankfurt PG (self-signed cert) needs.
let pool: Pool | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

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
