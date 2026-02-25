import type { Metadata } from "next";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
