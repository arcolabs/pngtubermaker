import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import CreditBar from "@/components/dashboard/CreditBar";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { auth } from "@/lib/auth";
import { listUserAvatars } from "@/lib/services/avatars";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your PNGTuber studio — manage avatars, credits, and creations.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
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
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return t("greetingMorning");
                if (hour < 18) return t("greetingAfternoon");
                return t("greetingEvening");
              })()}, {session.user.name?.split(" ")[0] || "Creator"}!
            </h1>
            <p className="text-gray-500 mt-1">{t("subtitle")}</p>
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
              {t("recentAvatars")}
            </h2>
            {recentAvatars.length > 0 && (
              <a
                href="/avatars"
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {t("viewAll")}
              </a>
            )}
          </div>
          <AvatarGrid avatars={recentAvatars} />
        </div>
      </div>
    </div>
  );
}
