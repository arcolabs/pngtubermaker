"use client";

import {
  ArrowUpDown,
  DollarSign,
  Flame,
  Moon,
  Search,
  Sparkles,
  UserMinus,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type {
  CustomerDashboardData,
  CustomerRow,
  UserSegment,
} from "@/lib/services/admin-customers";

// ── Segment config ──────────────────────────────────────────────────────────

const SEGMENTS: {
  key: UserSegment | "all";
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    key: "all",
    label: "All",
    icon: <Users className="w-3.5 h-3.5" />,
    description: "All users",
  },
  {
    key: "inactive",
    label: "Inactive",
    icon: <UserMinus className="w-3.5 h-3.5" />,
    description: "Registered but never created an avatar",
  },
  {
    key: "exploring",
    label: "Exploring",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    description: "Created avatars, still has free credits",
  },
  {
    key: "exhausted",
    label: "Exhausted",
    icon: <Flame className="w-3.5 h-3.5" />,
    description: "Used all free credits, never paid",
  },
  {
    key: "paying",
    label: "Paying",
    icon: <DollarSign className="w-3.5 h-3.5" />,
    description: "Has made at least one payment",
  },
  {
    key: "dormant",
    label: "Dormant",
    icon: <Moon className="w-3.5 h-3.5" />,
    description: "No activity in 30+ days",
  },
];

const SEGMENT_BADGE_CLASS: Record<UserSegment, string> = {
  inactive: "badge-error",
  exploring: "badge-warning",
  exhausted: "badge-secondary",
  paying: "badge-success",
  dormant: "badge-ghost",
};

const SEGMENT_LABEL: Record<UserSegment, string> = {
  inactive: "Inactive",
  exploring: "Exploring",
  exhausted: "Exhausted",
  paying: "Paying",
  dormant: "Dormant",
};

const PROVIDER_ICON: Record<string, string> = {
  google: "G",
  github: "GH",
  discord: "DC",
  twitch: "TW",
  unknown: "?",
};

// ── Helpers ─────────────────────────────────────────────────────────────────

type SortKey =
  | "createdAt"
  | "avatarCount"
  | "creditsBalance"
  | "totalPaidCents"
  | "lastActiveAt";

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function isValidSegment(s: string | null): s is UserSegment {
  return (
    s === "inactive" ||
    s === "exploring" ||
    s === "exhausted" ||
    s === "paying" ||
    s === "dormant"
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}

function CustomersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSegment = searchParams.get("segment");

  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<UserSegment | "all">(
    isValidSegment(initialSegment) ? initialSegment : "all",
  );
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    let list = data.customers;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      );
    }

    if (activeSegment !== "all") {
      list = list.filter((c) => c.segment === activeSegment);
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "createdAt":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "avatarCount":
          cmp = a.avatarCount - b.avatarCount;
          break;
        case "creditsBalance":
          cmp = a.creditsBalance - b.creditsBalance;
          break;
        case "totalPaidCents":
          cmp = a.totalPaidCents - b.totalPaidCents;
          break;
        case "lastActiveAt":
          cmp =
            new Date(a.lastActiveAt ?? 0).getTime() -
            new Date(b.lastActiveAt ?? 0).getTime();
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [data, activeSegment, sortKey, sortAsc, search]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error || "Failed to load data"}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      {/* Search + Segment filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            className="input input-bordered input-sm w-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SEGMENTS.map((seg) => {
            const segCount =
              seg.key === "all"
                ? data.stats.totalUsers
                : data.segmentCounts[seg.key];
            const isActive = activeSegment === seg.key;
            return (
              <button
                key={seg.key}
                type="button"
                className={`btn btn-xs gap-1 ${isActive ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setActiveSegment(seg.key)}
                title={seg.description}
              >
                {seg.icon}
                {seg.label}
                <span
                  className={`badge badge-xs ${isActive ? "bg-white/20 text-white" : "badge-neutral"}`}
                >
                  {segCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer table */}
      <div className="overflow-x-auto rounded-lg border border-base-200">
        <table className="table table-sm">
          <thead className="bg-base-200/50">
            <tr>
              <th>User</th>
              <th>Source</th>
              <th>
                <SortButton
                  label="Registered"
                  sortKey="createdAt"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={handleSort}
                />
              </th>
              <th>
                <SortButton
                  label="Avatars"
                  sortKey="avatarCount"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={handleSort}
                />
              </th>
              <th>
                <SortButton
                  label="Credits"
                  sortKey="creditsBalance"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={handleSort}
                />
              </th>
              <th>
                <SortButton
                  label="Total Paid"
                  sortKey="totalPaidCents"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={handleSort}
                />
              </th>
              <th>
                <SortButton
                  label="Last Active"
                  sortKey="lastActiveAt"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={handleSort}
                />
              </th>
              <th>Segment</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  {search ? "No matching users" : "No users in this segment"}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <CustomerTableRow
                  key={c.id}
                  customer={c}
                  onClick={() => router.push(`/admin/customers/${c.id}`)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Showing {filteredCustomers.length} of {data.stats.totalUsers} users
      </p>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SortButton({
  label,
  sortKey: key,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (key: SortKey) => void;
}) {
  const isActive = current === key;
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-primary transition-colors"
      onClick={() => onClick(key)}
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${isActive ? "text-primary" : "text-gray-300"}`}
      />
      {isActive && (
        <span className="text-[10px] text-primary">{asc ? "ASC" : "DESC"}</span>
      )}
    </button>
  );
}

function CustomerTableRow({
  customer: c,
  onClick,
}: {
  customer: CustomerRow;
  onClick: () => void;
}) {
  return (
    <tr className="hover:bg-base-200/30 cursor-pointer" onClick={onClick}>
      <td>
        <div>
          <p className="font-medium text-sm">{c.name}</p>
          <p className="text-xs text-gray-400">{c.email}</p>
        </div>
      </td>
      <td>
        <span className="badge badge-sm badge-outline font-mono text-[10px]">
          {PROVIDER_ICON[c.provider] ?? c.provider}
        </span>
      </td>
      <td className="text-sm">{formatDate(c.createdAt)}</td>
      <td className="text-sm">{c.avatarCount}</td>
      <td className="text-sm">{c.creditsBalance.toLocaleString()}</td>
      <td className="text-sm">
        {c.totalPaidCents > 0 ? (
          <span className="text-success font-medium">
            {formatCents(c.totalPaidCents)}
          </span>
        ) : (
          <span className="text-gray-300">{"\u2014"}</span>
        )}
      </td>
      <td className="text-sm">{formatDate(c.lastActiveAt)}</td>
      <td>
        <span className={`badge badge-sm ${SEGMENT_BADGE_CLASS[c.segment]}`}>
          {SEGMENT_LABEL[c.segment]}
        </span>
      </td>
    </tr>
  );
}
