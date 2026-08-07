/**
 * OPS TOOL — read-only audit of a single user's footprint by email.
 *
 * Companion to scripts/delete-user.ts: use it to scope a "delete my account"
 * request before deleting, and to verify the user is fully gone afterwards
 * (prints { found: false } once deleted). Touches nothing — pure SELECTs.
 *
 *   bun run scripts/inspect-user.ts <email>
 */
import { eq } from "drizzle-orm";
import {
  account,
  avatarExpressions,
  avatars,
  creditTransactions,
  expressionPacks,
  session,
  subscriptions,
  transactions,
  user,
  wallets,
} from "@/database/schema";
import { getDatabase } from "@/lib/db";

const EMAIL = process.argv[2];
if (!EMAIL) throw new Error("usage: inspect-user.ts <email>");

const db = getDatabase();

const [u] = await db.select().from(user).where(eq(user.email, EMAIL));
if (!u) {
  console.log(JSON.stringify({ found: false, email: EMAIL }, null, 2));
  process.exit(0);
}

const uid = u.id;
const av = await db.select().from(avatars).where(eq(avatars.userId, uid));
const avatarIds = av.map((a) => a.id);

const expr: (typeof avatarExpressions.$inferSelect)[] = [];
const packs: (typeof expressionPacks.$inferSelect)[] = [];
for (const aid of avatarIds) {
  expr.push(
    ...(await db
      .select()
      .from(avatarExpressions)
      .where(eq(avatarExpressions.avatarId, aid))),
  );
  packs.push(
    ...(await db
      .select()
      .from(expressionPacks)
      .where(eq(expressionPacks.avatarId, aid))),
  );
}

const sess = await db.select().from(session).where(eq(session.userId, uid));
const acc = await db.select().from(account).where(eq(account.userId, uid));
const wal = await db.select().from(wallets).where(eq(wallets.userId, uid));
const ctx = await db
  .select()
  .from(creditTransactions)
  .where(eq(creditTransactions.userId, uid));
const tx = await db
  .select()
  .from(transactions)
  .where(eq(transactions.userId, uid));
const sub = await db
  .select()
  .from(subscriptions)
  .where(eq(subscriptions.userId, uid));

// Collect every R2 key referenced by this user's data
const r2Keys = new Set<string>();
for (const a of av) {
  for (const k of [
    a.baseImageR2Key,
    a.originalBaseImageR2Key,
    a.thumbnailR2Key,
    a.referenceSheetR2Key,
  ]) {
    if (k) r2Keys.add(k);
  }
}
for (const e of expr) if (e.imageR2Key) r2Keys.add(e.imageR2Key);

console.log(
  JSON.stringify(
    {
      found: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        stripeCustomerId: u.stripeCustomerId,
        createdAt: u.createdAt,
      },
      counts: {
        avatars: av.length,
        expressions: expr.length,
        expressionPacks: packs.length,
        sessions: sess.length,
        accounts: acc.length,
        wallets: wal.length,
        creditTransactions: ctx.length,
        transactions: tx.length,
        subscriptions: sub.length,
      },
      stripeSubscriptionIds: sub.map((s) => s.stripeSubscriptionId),
      transactions: tx.map((t) => ({
        type: t.type,
        status: t.status,
        amount: t.amount,
        stripePaymentIntentId: t.stripePaymentIntentId,
      })),
      r2Keys: [...r2Keys],
    },
    null,
    2,
  ),
);
process.exit(0);
