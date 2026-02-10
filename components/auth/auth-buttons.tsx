"use client";

import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <Link
      href="/login"
      className="group relative inline-flex items-center gap-2 rounded-xl 
                 bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355]
                 px-5 py-2.5
                 transition-all duration-300 ease-out
                 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#FF0033]/30
                 active:scale-[0.98] active:duration-100
                 border border-white/20 hover:border-white/30
                 overflow-hidden"
    >
      <span className="relative font-semibold text-sm text-white tracking-wide">
        Sign In
      </span>
    </Link>
  );
}

export function UserButton() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <SignInButton />;
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => authClient.signOut()}
        className="group relative inline-flex items-center gap-2 rounded-xl 
                   px-4 py-2 text-sm font-medium text-white/80 
                   bg-white/5 backdrop-blur-sm border border-white/10
                   hover:bg-white/10 hover:border-white/20 
                   hover:text-white
                   shadow-[inset_0_0_16px_rgba(240,247,245,0.05)]
                   hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
                   transition-all duration-300 ease-out"
      >
        Sign Out
      </button>
    </div>
  );
}
