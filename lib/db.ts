import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

let sql: ReturnType<typeof neon> | undefined;
let db: ReturnType<typeof drizzle> | undefined;

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (!sql) {
    sql = neon(databaseUrl);
  }
  if (!db) {
    db = drizzle({ client: sql });
  }
  return db;
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
