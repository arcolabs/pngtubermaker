import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !isAdmin(session.user.id)) {
    notFound();
  }

  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
