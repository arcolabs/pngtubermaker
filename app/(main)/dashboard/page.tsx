import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import CreditBar from "@/components/dashboard/CreditBar";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import UsageStats from "@/components/dashboard/UsageStats";
import { auth } from "@/lib/auth";
import { TIER_CREDITS } from "@/lib/services/credits";

interface CreditBalance {
  total: number;
  subscription: number;
  purchased: number;
  expiresAt?: string;
}

interface Subscription {
  tier: "free" | "start" | "pro";
}

interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
}

async function getCreditBalance(): Promise<CreditBalance | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/credits/balance`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getSubscription(): Promise<Subscription | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/subscription`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getAvatars(): Promise<Avatar[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/avatars?limit=6`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.avatars || [];
  } catch {
    return [];
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

  const [balance, subscription, avatars] = await Promise.all([
    getCreditBalance(),
    getSubscription(),
    getAvatars(),
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
          <AvatarGrid avatars={avatars} />
        </div>

        <UsageStats
          creditsUsed={creditsUsed}
          monthlyLimit={monthlyLimit}
          avatarsCreated={avatars.length}
          periodEnd={balance?.expiresAt}
        />
      </div>
    </div>
  );
}
