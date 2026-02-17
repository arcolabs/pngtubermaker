"use client";

import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <Link href="/login" className="btn btn-primary btn-sm">
      Sign In
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
        <div className="avatar">
          <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => authClient.signOut()}
        className="btn btn-ghost btn-sm"
      >
        Sign Out
      </button>
    </div>
  );
}
