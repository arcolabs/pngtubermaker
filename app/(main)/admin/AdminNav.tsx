"use client";

import { Award, BarChart3, Handshake, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/customers", label: "Customers", icon: Users, exact: false },
  { href: "/admin/badges", label: "Badges", icon: Award, exact: false },
  { href: "/admin/partners", label: "Partners", icon: Handshake, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-base-200 bg-base-200/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 h-12">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-3">
            Admin
          </span>
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-gray-500 hover:text-gray-900 hover:bg-base-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
