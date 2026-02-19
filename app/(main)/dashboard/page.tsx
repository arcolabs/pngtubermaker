import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import CreditBar from "@/components/dashboard/CreditBar";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import UsageStats from "@/components/dashboard/UsageStats";
import { subscriptions } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { listUserAvatars } from "@/lib/services/avatars";
import { getBalance, TIER_CREDITS } from "@/lib/services/credits";

interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  expiresAt?: string;
}

interface Subscription {
  tier: "free" | "start" | "pro";
}

async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  try {
    const balance = await getBalance(userId);
    return {
      total: balance.total,
      subscription: balance.subscription,
      purchased: balance.purchased,
      expiresAt: balance.subscriptionExpiresAt?.toISOString(),
    };
  } catch {
    return null;
  }
}

async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const db = getDatabase();
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!sub[0] || sub[0].status !== "active") {
      return { tier: "free" };
    }
    return { tier: sub[0].tier as "free" | "start" | "pro" };
  } catch {
    return null;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const [balance, subscription, recentAvatars] = await Promise.all([
    getCreditBalance(userId),
    getSubscription(userId),
    listUserAvatars(userId, 6).catch(() => []),
  ]);

  const tier = (subscription?.tier ?? "free") as keyof typeof TIER_CREDITS;
  const monthlyLimit = TIER_CREDITS[tier] || TIER_CREDITS.free;

  const creditsUsed = balance?.subscription ?? 0;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {session.user.name?.split(" ")[0] || "Creator"}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s your PNGTuber studio overview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CreditBar balance={balance} subscription={subscription} />
          </div>
          <QuickActionCard />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Recent Avatars
          </h2>
          <AvatarGrid avatars={recentAvatars} />
        </div>

        <UsageStats
          creditsUsed={creditsUsed}
          monthlyLimit={monthlyLimit}
          avatarsCreated={recentAvatars.length}
          periodEnd={balance?.expiresAt}
        />
      </div>
    </div>
  );
}
