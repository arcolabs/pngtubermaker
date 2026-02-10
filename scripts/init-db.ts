import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const sql = neon(databaseUrl);

async function initDb() {
  console.log("Creating database tables...");

  // Create user table
  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "email_verified" BOOLEAN NOT NULL,
      "image" TEXT,
      "created_at" TIMESTAMP NOT NULL,
      "updated_at" TIMESTAMP NOT NULL
    )
  `;
  console.log("✓ user table created");

  // Create session table
  await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expires_at" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "created_at" TIMESTAMP NOT NULL,
      "updated_at" TIMESTAMP NOT NULL,
      "ip_address" TEXT,
      "user_agent" TEXT,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    )
  `;
  console.log("✓ session table created");

  // Create account table
  await sql`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "account_id" TEXT NOT NULL,
      "provider_id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "access_token" TEXT,
      "refresh_token" TEXT,
      "id_token" TEXT,
      "access_token_expires_at" TIMESTAMP,
      "refresh_token_expires_at" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "created_at" TIMESTAMP NOT NULL,
      "updated_at" TIMESTAMP NOT NULL
    )
  `;
  console.log("✓ account table created");

  // Create verification table
  await sql`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expires_at" TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP,
      "updated_at" TIMESTAMP
    )
  `;
  console.log("✓ verification table created");

  // Create images table (for R2 storage)
  await sql`
    CREATE TABLE IF NOT EXISTS "images" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "type" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "original_name" TEXT,
      "mime_type" TEXT NOT NULL,
      "size" TEXT NOT NULL,
      "width" TEXT,
      "height" TEXT,
      "r2_key" TEXT NOT NULL,
      "r2_url" TEXT NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ images table created");

  // Create generated_thumbnails table (for AI generation tracking)
  await sql`
    CREATE TABLE IF NOT EXISTS "generated_thumbnails" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "source_image_id" TEXT REFERENCES "images"("id"),
      "prompt" TEXT,
      "result_image_id" TEXT REFERENCES "images"("id"),
      "status" TEXT NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ generated_thumbnails table created");

  console.log("\n✅ All tables created successfully!");
}

initDb().catch((error) => {
  console.error("❌ Error creating tables:", error);
  process.exit(1);
});
