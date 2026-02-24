import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import CreditBar from "@/components/dashboard/CreditBar";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { auth } from "@/lib/auth";
import { listUserAvatars } from "@/lib/services/avatars";

export const dynamic = "force-dynamic";

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
  const recentAvatars = await listUserAvatars(userId, 6).catch(() => []);

  // New users with no avatars → skip empty dashboard, go straight to create
  if (recentAvatars.length === 0) {
    redirect("/create?welcome=1");
  }

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
        <CreditBar />

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
