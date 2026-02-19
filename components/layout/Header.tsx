"use client";

import {
  Coins,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { brand } from "@/lib/brand";

interface CreditBalance {
  total: number;
}

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

export default function Header() {
  const pathname = usePathname();
  const { user, isHydrated, hydrate, signOut } = useAuthStore();
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(
    null,
  );

  const avatarRef = useRef<HTMLDivElement>(null);
  const closeAvatar = useCallback(() => setIsAvatarOpen(false), []);
  useClickOutside(avatarRef, closeAvatar);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchCreditBalance = async () => {
      try {
        const res = await fetch("/api/credits/balance");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setCreditBalance(data);
        }
      } catch (error) {
        console.error("Failed to fetch credit balance:", error);
      }
    };

    fetchCreditBalance();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleFocus = async () => {
      try {
        const res = await fetch("/api/credits/balance");
        if (res.ok) {
          const data = await res.json();
          setCreditBalance(data);
        }
      } catch (error) {
        console.error("Failed to fetch credit balance:", error);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const isLoggedIn = !!user;

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
                    {creditBalance?.total?.toLocaleString() ?? "..."}
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
                      <img
                        src={user.image}
                        alt={user.name ?? "User"}
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
                  <ul className="absolute right-0 mt-2 w-56 menu bg-base-200 rounded-box p-2 shadow-xl border border-base-content/10 z-50">
                    <li>
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-base-300 rounded-lg pointer-events-none">
                        <Coins className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {creditBalance?.total?.toLocaleString() ?? "..."}{" "}
                          credits
                        </span>
                      </div>
                    </li>
                    <li>
                      <Link href="/create" onClick={closeAvatar}>
                        <Sparkles className="w-4 h-4" />
                        Create New
                      </Link>
                    </li>
                    <div className="divider my-1" />
                    <li>
                      <Link href="/avatars" onClick={closeAvatar}>
                        <ImagePlus className="w-4 h-4" />
                        My Avatars
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard" onClick={closeAvatar}>
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" onClick={closeAvatar}>
                        <Tag className="w-4 h-4" />
                        Pricing
                      </Link>
                    </li>
                    <div className="divider my-1" />
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          closeAvatar();
                          handleSignOut();
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </li>
                  </ul>
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
