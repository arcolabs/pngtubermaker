/**
 * OPS TOOL — manual GDPR / "please delete my account" requests.
 *
 * There is intentionally NO self-serve account deletion in the product (the
 * volume is tiny). When a user emails support asking to be deleted, run this
 * by hand after confirming their email.
 *
 * What it does, in order:
 *   1. Collects every R2 object the user owns — stored keys on their avatars
 *      AND candidate-image URLs for avatars left in `status: selecting`
 *      (those have no R2 key column but the files still exist in the bucket).
 *   2. Deletes those R2 objects.
 *   3. Deletes the `user` row, which cascades to all child tables via FK
 *      onDelete: "cascade" (account, session, wallets, credit_transactions,
 *      transactions, subscriptions, avatars -> expression_packs / avatar_expressions).
 *
 * Stripe is NOT touched. If the user ever paid (stripeCustomerId set / has
 * subscriptions), handle that side in the Stripe dashboard separately first.
 *
 * Always dry-run first to eyeball the targets, then re-run with --confirm.
 * Verify afterwards with: bun run scripts/inspect-user.ts <email>
 *
 *   bun run scripts/delete-user.ts <email>            # dry run (prints targets)
 *   bun run scripts/delete-user.ts <email> --confirm  # execute (irreversible)
 */
import { eq } from "drizzle-orm";
import { avatarExpressions, avatars, user } from "@/database/schema";
import { getDatabase } from "@/lib/db";
import { deleteObject, getPublicUrl } from "@/lib/services/r2";

const EMAIL = process.argv[2];
const CONFIRM = process.argv.includes("--confirm");
if (!EMAIL) throw new Error("usage: delete-user.ts <email> [--confirm]");

const db = getDatabase();
const [u] = await db.select().from(user).where(eq(user.email, EMAIL));
if (!u) {
  console.log(`No user with email ${EMAIL}. Nothing to do.`);
  process.exit(0);
}

const av = await db.select().from(avatars).where(eq(avatars.userId, u.id));

// Collect R2 keys: stored keys + candidate-image URLs (status: selecting)
const publicPrefix = `${getPublicUrl("").replace(/\/$/, "")}/`;
const keys = new Set<string>();
const addUrl = (url: string | null | undefined) => {
  if (url?.startsWith(publicPrefix)) keys.add(url.slice(publicPrefix.length));
};
const addKey = (k: string | null | undefined) => {
  if (k) keys.add(k);
};
for (const a of av) {
  addKey(a.baseImageR2Key);
  addKey(a.originalBaseImageR2Key);
  addKey(a.thumbnailR2Key);
  addKey(a.referenceSheetR2Key);
  for (const c of a.candidateImages ?? []) addUrl(c);
  const expr = await db
    .select()
    .from(avatarExpressions)
    .where(eq(avatarExpressions.avatarId, a.id));
  for (const e of expr) addKey(e.imageR2Key);
}

console.log(`User: ${u.email} (${u.id})  avatars=${av.length}`);
console.log(`R2 objects to delete (${keys.size}):`);
for (const k of keys) console.log(`  - ${k}`);

if (!CONFIRM) {
  console.log("\nDRY RUN. Re-run with --confirm to execute.");
  process.exit(0);
}

for (const k of keys) {
  await deleteObject(k);
  console.log(`deleted R2: ${k}`);
}

await db.delete(user).where(eq(user.id, u.id));
console.log(`deleted user row (cascaded all child tables): ${u.id}`);
process.exit(0);
