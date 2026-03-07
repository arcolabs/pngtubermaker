"use client";

import {
  ArrowLeft,
  CreditCard,
  Eraser,
  Image,
  ImageIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Wallet,
} from "lucide-react";
import Image_ from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  AvatarImageGroup,
  AvatarImageItem,
  CreditHistoryRow,
  CustomerDetail,
  GenerationRow,
  PaymentRow,
} from "@/lib/services/admin-customer-detail";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const CREDIT_TYPE_BADGE: Record<string, string> = {
  grant_subscription: "badge-info",
  grant_purchase: "badge-success",
  grant_welcome: "badge-accent",
  consume: "badge-warning",
  refund: "badge-secondary",
  expire: "badge-error",
};

const CREDIT_TYPE_LABEL: Record<string, string> = {
  grant_subscription: "Subscription",
  grant_purchase: "Purchase",
  grant_welcome: "Welcome",
  consume: "Consume",
  refund: "Refund",
  expire: "Expire",
};

const STATUS_BADGE: Record<string, string> = {
  completed: "badge-success",
  generating: "badge-info",
  selecting: "badge-warning",
  pending: "badge-ghost",
  failed: "badge-error",
  cancelled: "badge-ghost",
};

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  discord: "Discord",
  twitch: "Twitch",
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "credits" | "generations" | "payments" | "images"
  >("credits");

  // Credit adjustment modal
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAction, setCreditAction] = useState<"grant" | "refund">("grant");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreditAdjust() {
    const amount = Number.parseInt(creditAmount, 10);
    if (!amount || amount <= 0 || !creditReason.trim()) return;

    setAdjusting(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: creditAction,
          amount,
          reason: creditReason.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setShowCreditModal(false);
      setCreditAmount("");
      setCreditReason("");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to adjust credits");
    } finally {
      setAdjusting(false);
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
          <p className="text-error mb-4">{error || "User not found"}</p>
          <Link href="/admin/customers" className="btn btn-primary btn-sm">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="btn btn-ghost btn-sm btn-circle"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.user.name}</h1>
          <p className="text-sm text-gray-400">{data.user.email}</p>
        </div>
        {data.user.image && (
          <Image_
            src={data.user.image}
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full ml-auto"
          />
        )}
      </div>

      {/* Top cards: User info + Wallet + Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* User info */}
        <div className="bg-base-200/50 rounded-lg p-4 border border-base-200 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Account
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Provider</span>
              <span className="font-medium">
                {PROVIDER_LABEL[data.user.provider] ?? data.user.provider}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Registered</span>
              <span>{formatDate(data.user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-base-200/50 rounded-lg p-4 border border-base-200 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Wallet
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                className="btn btn-success btn-xs gap-1"
                onClick={() => {
                  setCreditAction("grant");
                  setShowCreditModal(true);
                }}
              >
                <Plus className="w-3 h-3" />
                Grant
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs gap-1"
                onClick={() => {
                  setCreditAction("refund");
                  setShowCreditModal(true);
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Refund
              </button>
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="text-lg font-bold">
                {data.wallet.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subscription</span>
              <span>{data.wallet.subscriptionCredits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Purchased</span>
              <span>{data.wallet.purchasedCredits.toLocaleString()}</span>
            </div>
            {data.wallet.subscriptionExpiresAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Expires</span>
                <span className="text-xs text-warning">
                  {formatDate(data.wallet.subscriptionExpiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-base-200/50 rounded-lg p-4 border border-base-200 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Subscription
          </h2>
          {data.subscription ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tier</span>
                <span className="font-medium capitalize">
                  {data.subscription.tier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`badge badge-sm ${data.subscription.status === "active" ? "badge-success" : "badge-warning"}`}
                >
                  {data.subscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Period End</span>
                <span>{formatDate(data.subscription.currentPeriodEnd)}</span>
              </div>
              {data.subscription.cancelAtPeriodEnd && (
                <p className="text-xs text-error font-medium">
                  Will cancel at period end
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No active subscription</p>
          )}
        </div>
      </div>

      {/* History Tabs */}
      <div className="flex gap-1 border-b border-base-200">
        {(
          [
            { key: "credits", label: "Credit History", icon: Wallet },
            { key: "generations", label: "Generations", icon: Image },
            { key: "images", label: "Images", icon: ImageIcon },
            { key: "payments", label: "Payments", icon: CreditCard },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.key === "credits"
              ? data.creditHistory.length
              : tab.key === "generations"
                ? data.generations.length
                : tab.key === "images"
                  ? data.avatarImages.length
                  : data.payments.length;
          return (
            <button
              key={tab.key}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className="badge badge-xs badge-neutral">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="overflow-x-auto rounded-lg border border-base-200">
        {activeTab === "credits" && (
          <CreditHistoryTable rows={data.creditHistory} />
        )}
        {activeTab === "generations" && (
          <GenerationsTable rows={data.generations} />
        )}
        {activeTab === "images" && (
          <AvatarImagesPanel
            groups={data.avatarImages}
            userId={id}
            onRefresh={fetchData}
          />
        )}
        {activeTab === "payments" && <PaymentsTable rows={data.payments} />}
      </div>

      {/* Credit adjustment modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold capitalize">
              {creditAction} Credits
            </h3>
            <div>
              <label className="text-sm text-gray-500" htmlFor="credit-amount">
                Amount
              </label>
              <input
                id="credit-amount"
                type="number"
                min="1"
                max="100000"
                className="input input-bordered w-full mt-1"
                placeholder="e.g. 500"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="credit-reason">
                Reason
              </label>
              <input
                id="credit-reason"
                type="text"
                className="input input-bordered w-full mt-1"
                placeholder="e.g. Customer support compensation"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowCreditModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-sm ${creditAction === "grant" ? "btn-success" : "btn-secondary"}`}
                disabled={
                  adjusting ||
                  !creditAmount ||
                  Number(creditAmount) <= 0 ||
                  !creditReason.trim()
                }
                onClick={handleCreditAdjust}
              >
                {adjusting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    {creditAction === "grant" ? (
                      <Plus className="w-3.5 h-3.5" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Confirm {creditAction}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tables ──────────────────────────────────────────────────────────────────

function CreditHistoryTable({ rows }: { rows: CreditHistoryRow[] }) {
  if (rows.length === 0) return <EmptyState text="No credit transactions" />;
  return (
    <table className="table table-sm">
      <thead className="bg-base-200/50">
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Balance</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-base-200/30">
            <td className="text-xs whitespace-nowrap">
              {formatDate(r.createdAt)}
            </td>
            <td>
              <span
                className={`badge badge-xs ${CREDIT_TYPE_BADGE[r.type] ?? "badge-ghost"}`}
              >
                {CREDIT_TYPE_LABEL[r.type] ?? r.type}
              </span>
            </td>
            <td
              className={`font-mono text-sm ${r.amount >= 0 ? "text-success" : "text-error"}`}
            >
              {r.amount >= 0 ? "+" : ""}
              {r.amount.toLocaleString()}
            </td>
            <td className="text-sm">{r.balanceAfter.toLocaleString()}</td>
            <td className="text-xs text-gray-500 max-w-xs truncate">
              {r.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GenerationsTable({ rows }: { rows: GenerationRow[] }) {
  if (rows.length === 0) return <EmptyState text="No generations" />;
  return (
    <table className="table table-sm">
      <thead className="bg-base-200/50">
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Label</th>
          <th>Status</th>
          <th>Credits</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-base-200/30">
            <td className="text-xs whitespace-nowrap">
              {formatDate(r.createdAt)}
            </td>
            <td>
              <span className="flex items-center gap-1 text-xs">
                {r.kind === "avatar" ? (
                  <Image className="w-3 h-3 text-primary" />
                ) : (
                  <Sparkles className="w-3 h-3 text-secondary" />
                )}
                {r.kind}
              </span>
            </td>
            <td className="text-sm max-w-xs truncate">{r.label}</td>
            <td>
              <span
                className={`badge badge-xs ${STATUS_BADGE[r.status] ?? "badge-ghost"}`}
              >
                {r.status}
              </span>
            </td>
            <td className="text-sm font-mono">
              {r.creditsUsed > 0 ? `-${r.creditsUsed}` : "\u2014"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  if (rows.length === 0) return <EmptyState text="No payments" />;
  return (
    <table className="table table-sm">
      <thead className="bg-base-200/50">
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Stripe</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-base-200/30">
            <td className="text-xs whitespace-nowrap">
              {formatDate(r.createdAt)}
            </td>
            <td>
              <span className="badge badge-xs badge-outline capitalize">
                {r.type}
              </span>
            </td>
            <td className="text-sm font-medium">
              {formatCents(r.amount)} {r.currency.toUpperCase()}
            </td>
            <td>
              <span
                className={`badge badge-xs ${STATUS_BADGE[r.status] ?? "badge-ghost"}`}
              >
                {r.status}
              </span>
            </td>
            <td className="text-xs text-gray-400 font-mono max-w-[120px] truncate">
              {r.stripeSessionId ?? "\u2014"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AvatarImagesPanel({
  groups,
  userId,
  onRefresh,
}: {
  groups: AvatarImageGroup[];
  userId: string;
  onRefresh: () => void;
}) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemoveBg(item: AvatarImageItem) {
    if (removingId) return;
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/admin/customers/${userId}/remove-bg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: item.id, kind: item.kind }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Background removal failed");
    } finally {
      setRemovingId(null);
    }
  }

  if (groups.length === 0) return <EmptyState text="No avatars" />;

  return (
    <div className="p-4 space-y-6">
      {groups.map((group) => (
        <div key={group.avatarId} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`badge badge-xs ${STATUS_BADGE[group.status] ?? "badge-ghost"}`}
            >
              {group.status}
            </span>
            <span className="text-sm font-medium truncate max-w-md">
              {group.prompt}
            </span>
            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
              {formatDate(group.createdAt)}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {group.baseImage && (
              <ImageCard
                item={group.baseImage}
                removing={removingId === group.baseImage.id}
                onRemoveBg={() => {
                  if (group.baseImage) {
                    handleRemoveBg(group.baseImage);
                  }
                }}
              />
            )}
            {group.expressions.map((expr) => (
              <ImageCard
                key={expr.id}
                item={expr}
                removing={removingId === expr.id}
                onRemoveBg={() => handleRemoveBg(expr)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ImageCard({
  item,
  removing,
  onRemoveBg,
}: {
  item: AvatarImageItem;
  removing: boolean;
  onRemoveBg: () => void;
}) {
  return (
    <div className="relative group border border-base-200 rounded-lg overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
      {item.imageUrl ? (
        <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
          <Image_
            src={item.imageUrl}
            alt={item.label}
            width={200}
            height={200}
            className="w-full aspect-square object-cover"
            unoptimized
          />
        </a>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center text-gray-300">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 flex items-center justify-between">
        <span className="text-xs text-white font-medium truncate">
          {item.label}
        </span>
        {item.imageUrl && (
          <button
            type="button"
            className="btn btn-xs btn-ghost text-white hover:bg-white/20"
            onClick={onRemoveBg}
            disabled={removing}
            title="Remove background"
          >
            {removing ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Eraser className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
      {text}
    </div>
  );
}
