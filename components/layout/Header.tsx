"use client";

import {
  Coins,
  Crown,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Tag,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useAuthStore } from "@/hooks/use-auth-store";
import {
  type CreditBalance,
  useSubscriptionStore,
} from "@/hooks/use-subscription-store";
import { brand } from "@/lib/brand";
import type { Tier } from "@/lib/stripe";
import { formatCreditsCompact } from "@/lib/utils";

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

const TIER_DISPLAY: Record<
  Tier,
  { label: string; icon: typeof User; className: string }
> = {
  free: {
    label: "Free",
    icon: User,
    className: "bg-base-300 text-base-content/60",
  },
  start: {
    label: "Start",
    icon: Zap,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  pro: {
    label: "Pro",
    icon: Crown,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

function getCreditProgress(
  balance: CreditBalance | null,
  monthlyCredits: number,
): number {
  if (!balance || monthlyCredits <= 0) return 0;
  const used = monthlyCredits - balance.subscription;
  return Math.round((used / monthlyCredits) * 100);
}

export default function Header() {
  const pathname = usePathname();
  const { user, isHydrated, hydrate, signOut } = useAuthStore();
  const { credits, subscription, refresh } = useSubscriptionStore();
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const closeAvatar = useCallback(() => setIsAvatarOpen(false), []);
  useClickOutside(avatarRef, closeAvatar);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  // Fetch data on login
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  // Refresh on window focus
  useEffect(() => {
    if (!user) return;
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, refresh]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const isLoggedIn = !!user;
  const currentTier: Tier = subscription?.tier || "free";
  const tierDisplay = TIER_DISPLAY[currentTier];
  const monthlyCredits = subscription?.monthlyCredits ?? 0;
  const creditProgress = getCreditProgress(credits, monthlyCredits);
  const TierIcon = tierDisplay.icon;

  return (
    <header className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-sm">
      <nav className="navbar container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="navbar-start">
          <Link
            href="/"
            className="flex items-center group select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={brand.logo.svgPath}
              alt={brand.logo.alt}
              width={120}
              height={48}
              className="h-10 sm:h-12 transition-transform duration-200 group-hover:scale-105 pointer-events-none select-none"
              style={{ width: "auto" }}
              priority
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {isLoggedIn && (
              <li>
                <Link
                  href="/dashboard"
                  className={
                    pathname === "/dashboard"
                      ? "text-primary font-medium bg-primary/10"
                      : "text-base-content/70 hover:text-primary hover:bg-primary/10"
                  }
                >
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/pricing"
                className={
                  pathname === "/pricing"
                    ? "text-primary font-medium bg-primary/10"
                    : "text-base-content/70 hover:text-primary hover:bg-primary/10"
                }
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end gap-2">
          {isLoggedIn ? (
            <>
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-base-200 rounded-full">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {credits?.total?.toLocaleString() ?? "..."}
                  </span>
                </div>
                <Link href="/create" className="btn btn-primary btn-sm">
                  Create
                </Link>
              </div>

              <div className="relative" ref={avatarRef}>
                <button
                  type="button"
                  className="btn btn-ghost btn-circle avatar"
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                >
                  {user?.image ? (
                    <div className="w-9 rounded-full">
                      <SafeImage
                        src={user.image}
                        alt={user.name ?? "User"}
                        width={36}
                        height={36}
                        className="w-9 rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>

                {isAvatarOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-base-100 rounded-2xl shadow-xl border border-base-content/5 z-50 overflow-hidden">
                    {/* User Header */}
                    <div className="p-4 bg-gradient-to-br from-base-200/50 to-base-100">
                      <div className="flex items-center gap-3">
                        {user?.image ? (
                          <SafeImage
                            src={user.image}
                            alt={user.name ?? "User"}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full ring-2 ring-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-white">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {user?.name || "Creator"}
                          </p>
                          <p className="text-xs text-base-content/50 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Tier Badge */}
                      <div className="mt-3">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tierDisplay.className}`}
                        >
                          <TierIcon className="w-3.5 h-3.5" />
                          {tierDisplay.label}
                          {subscription?.cancelAtPeriodEnd && (
                            <span className="text-[10px] opacity-70">
                              (ends soon)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Credits Section */}
                    <div className="px-4 py-3 border-b border-base-content/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <Coins className="w-4 h-4" />
                          <span>Credits</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCreditsCompact(credits?.total ?? 0)}
                          {monthlyCredits > 0 && (
                            <span className="text-xs text-base-content/40 font-normal ml-1">
                              / {formatCreditsCompact(monthlyCredits)}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Progress Bar for paid tiers */}
                      {monthlyCredits > 0 && (
                        <div className="relative h-1.5 bg-base-200 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(creditProgress, 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="p-2">
                      <Link
                        href="/create"
                        onClick={closeAvatar}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-primary to-cyan-400 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                      >
                        <Sparkles className="w-4 h-4" />
                        Create New
                      </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="px-2 pb-2">
                      <div className="grid grid-cols-3 gap-1">
                        <Link
                          href="/avatars"
                          onClick={closeAvatar}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-base-200 transition-colors"
                        >
                          <ImagePlus className="w-5 h-5 text-base-content/60" />
                          <span className="text-xs text-base-content/70">
                            Avatars
                          </span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={closeAvatar}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-base-200 transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5 text-base-content/60" />
                          <span className="text-xs text-base-content/70">
                            Dashboard
                          </span>
                        </Link>
                        <Link
                          href="/pricing"
                          onClick={closeAvatar}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-base-200 transition-colors"
                        >
                          <Tag className="w-5 h-5 text-base-content/60" />
                          <span className="text-xs text-base-content/70">
                            Pricing
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-base-content/5">
                      <button
                        type="button"
                        onClick={() => {
                          closeAvatar();
                          handleSignOut();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-base-content/60 hover:text-base-content hover:bg-base-200 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Get Started Free
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
