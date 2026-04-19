"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Bind the authenticated user's email to the Traffic Source tracker's
 * anonymous visitor_id. Fires once per email change; the tracker itself
 * dedups subsequent calls within the same browser session. Optional
 * chaining keeps this safe if t.js was blocked or hasn't loaded yet.
 */
export function TrafficSourceIdentify() {
  const { data } = authClient.useSession();
  const email = data?.user?.email;

  useEffect(() => {
    if (!email) return;
    (window as unknown as { ts?: { identify?: (email: string) => void } })
      .ts?.identify?.(email);
  }, [email]);

  return null;
}
