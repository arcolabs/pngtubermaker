import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import CreditBar from "@/components/dashboard/CreditBar";
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {session.user.name?.split(" ")[0] || "Creator"}!
          </h1>
          <p className="text-base-content/60">
            Here&apos;s an overview of your PNGTuber activity
          </p>
        </div>

        <CreditBar balance={balance} subscription={subscription} />

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <a href="/create" className="btn btn-primary btn-block">
              Create New PNGTuber
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Avatars</h2>
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
