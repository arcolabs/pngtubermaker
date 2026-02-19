import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import CreditBar from "@/components/dashboard/CreditBar";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
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
  expiresAt?: string;
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
    return {
      tier: sub[0].tier as "free" | "start" | "pro",
      expiresAt: sub[0].currentPeriodEnd?.toISOString(),
    };
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Breadcrumb items={[{ label: "Dashboard" }]} />

        <div className="flex items-end gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {getGreeting()}, {session.user.name?.split(" ")[0] || "Creator"}!
            </h1>
            <p className="text-gray-500 mt-1">
              Here&apos;s your PNGTuber studio overview
            </p>
          </div>
        </div>

        {/* Create CTA — standalone full-width row */}
        <QuickActionCard />

        {/* Credits + Usage — full width */}
        <CreditBar
          balance={balance}
          subscription={subscription}
          creditsUsed={creditsUsed}
          monthlyLimit={monthlyLimit}
        />

        {/* Recent Avatars */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Avatars
            </h2>
            {recentAvatars.length > 0 && (
              <a
                href="/avatars"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View All →
              </a>
            )}
          </div>
          <AvatarGrid avatars={recentAvatars} />
        </div>
      </div>
    </div>
  );
}
