# Launch Blockers — Execution Tasks

> Date: 2026-02-19
> Status: Ready for assignment
> Reference: Post-audit findings after API route fixes (commit f9b4d40+)

---

## Overview

6 tasks, grouped by priority. Each task is self-contained with exact file paths, code snippets, and acceptance criteria.

| # | Task | Priority | Effort | Assignee |
|---|------|----------|--------|----------|
| 1 | Dashboard: replace fetch() with direct DB queries | P0 | ~30 min | Backend |
| 2 | Wire "Add Expression" button | P0 | ~45 min | Frontend |
| 3 | Wire top-up flow + redirect fix | P0 | ~1 hour | Full-stack |
| 4 | Implement Free-tier watermark | P1 | ~30 min | Backend |
| 5 | Fix mock adapter relative URLs | P1 | ~20 min | Backend |
| 6 | Convert /avatars page to server component | P1 | ~30 min | Frontend |

---

## Task 1: Dashboard — Replace fetch() with Direct DB Queries

**Priority**: P0 — Production blocker
**File**: `app/(main)/dashboard/page.tsx`

### Problem

Dashboard is a server component that fetches its own API routes via HTTP:

```typescript
// Lines 31-36 — no cookie forwarded = 401 in production
const res = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/credits/balance`,
  { cache: "no-store" },
);
```

The `fetch()` calls to `/api/credits/balance`, `/api/subscription`, and `/api/avatars?limit=6` do not forward the user's session cookie. In production these return 401, so Dashboard shows empty data.

### Solution

Replace the three HTTP fetches with direct service/DB calls. The page already has access to `session` (line 83), so we can query directly.

**Replace `getCreditBalance()`** (lines 29-42):

```typescript
import { getBalance } from "@/lib/services/credits";

async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  try {
    const balance = await getBalance(userId);
    return {
      total: balance.total,
      subscription: balance.subscription,
      purchased: balance.purchased,
      expiresAt: balance.subscriptionExpiresAt?.toISOString(),
    };
  } catch {
    return null;
  }
}
```

**Replace `getSubscription()`** (lines 44-57):

```typescript
import { eq } from "drizzle-orm";
import { subscriptions } from "@/database/schema";
import { getDatabase } from "@/lib/db";

async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const db = getDatabase();
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (!sub[0] || sub[0].status !== "active") {
      return { tier: "free" };
    }
    return { tier: sub[0].tier as "free" | "start" | "pro" };
  } catch {
    return null;
  }
}
```

**Replace `getAvatars()`** (lines 59-73):

```typescript
import { and, count, desc, eq } from "drizzle-orm";
import { avatarExpressions, avatars } from "@/database/schema";

async function getAvatars(userId: string): Promise<Avatar[]> {
  try {
    const db = getDatabase();
    const userAvatars = await db
      .select({
        id: avatars.id,
        name: avatars.name,
        thumbnailUrl: avatars.thumbnailUrl,
        createdAt: avatars.createdAt,
      })
      .from(avatars)
      .where(and(eq(avatars.userId, userId), eq(avatars.status, "completed")))
      .orderBy(desc(avatars.createdAt))
      .limit(6);

    const result: Avatar[] = [];
    for (const a of userAvatars) {
      const exprCount = await db
        .select({ count: count() })
        .from(avatarExpressions)
        .where(eq(avatarExpressions.avatarId, a.id));

      result.push({
        id: a.id,
        name: a.name,
        thumbnailUrl: a.thumbnailUrl,
        expressionCount: exprCount[0]?.count ?? 0,
        createdAt: a.createdAt?.toISOString() ?? "",
      });
    }
    return result;
  } catch {
    return [];
  }
}
```

**Update the call site** (line 86):

```typescript
// Before:
const [balance, subscription, avatars] = await Promise.all([
  getCreditBalance(),
  getSubscription(),
  getAvatars(),
]);

// After:
const userId = session.user.id;
const [balance, subscription, avatars] = await Promise.all([
  getCreditBalance(userId),
  getSubscription(userId),
  getAvatars(userId),
]);
```

**Clean up imports**: Remove any unused imports at top of file. The `fetch` calls are fully replaced, so no HTTP-related imports needed.

### Acceptance Criteria

- [ ] Dashboard loads correctly when logged in (no empty sections)
- [ ] No `fetch()` calls to own API routes remain in the file
- [ ] Credits, subscription tier, and recent avatars all display
- [ ] `bun run check` passes
- [ ] `bun run build` passes

---

## Task 2: Wire "Add Expression" Button

**Priority**: P0 — Core feature broken
**File**: `components/avatars/AvatarDetailClient.tsx`

### Problem

Line 65-67 — the "Add Expression" button logs to console and does nothing:

```typescript
const handleAddExpression = () => {
  console.log("Add expression");
};
```

The API endpoint `POST /api/avatars/[id]/expressions` already exists and works (see `app/api/avatars/[id]/expressions/route.ts`). The button just needs to be wired up.

### Solution

Add a modal/dropdown to pick expression types, then call the API.

**Step 1**: Add state variables (near line 43):

```typescript
const [expressions, setExpressions] = useState(initialExpressions);
const [addingExpression, setAddingExpression] = useState(false);
const [showExpressionPicker, setShowExpressionPicker] = useState(false);
```

Note: `expressions` is currently declared with `const [expressions] = useState(...)` (no setter). Change it to include the setter.

**Step 2**: Compute available types (line 69 area):

```typescript
const existingTypes = new Set(expressions.map((e) => e.type));
const availableTypes = ["idle", "talking", "happy", "sad", "angry", "surprised"]
  .filter((t) => !existingTypes.has(t));
const canAddMore = availableTypes.length > 0;
```

**Step 3**: Implement `handleAddExpression`:

```typescript
const handleAddExpression = async (types: string[]) => {
  if (!types.length) return;
  setAddingExpression(true);
  setShowExpressionPicker(false);

  try {
    const res = await fetch(`/api/avatars/${avatar.id}/expressions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expressions: types }),
    });

    if (!res.ok) {
      const data = await res.json();
      if (data.error === "insufficient_credits") {
        alert(`Not enough credits. Balance: ${data.balance}, Required: ${data.required}`);
        return;
      }
      throw new Error(data.error || "Failed to generate expressions");
    }

    const data = await res.json();
    // Append new expressions to list
    setExpressions((prev) => [...prev, ...data.expressions]);
  } catch (error) {
    console.error("Failed to add expression:", error);
    alert(error instanceof Error ? error.message : "Failed to add expression");
  } finally {
    setAddingExpression(false);
  }
};
```

**Step 4**: Replace the "Add Expression" button (lines 103-111):

```tsx
{canAddMore && (
  <div className="dropdown dropdown-bottom">
    <button
      type="button"
      tabIndex={0}
      className="btn btn-sm btn-outline border-gray-200 hover:border-primary hover:text-primary"
      disabled={addingExpression}
    >
      <Plus className="w-4 h-4" />
      {addingExpression ? "Generating..." : "Add Expression"}
    </button>
    <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-lg bg-white rounded-xl w-52 mt-2">
      {availableTypes.map((type) => (
        <li key={type}>
          <button type="button" onClick={() => handleAddExpression([type])}>
            {expressionLabels[type] || type}
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
```

### Acceptance Criteria

- [ ] Clicking "Add Expression" opens a dropdown with available types
- [ ] Selecting a type calls `POST /api/avatars/[id]/expressions`
- [ ] New expression appears in the grid after generation
- [ ] Button shows "Generating..." while loading, disabled during request
- [ ] Insufficient credits shows an alert with balance info
- [ ] Already-generated types are excluded from the dropdown
- [ ] `bun run check` passes

---

## Task 3: Wire Top-up Flow + Fix Redirect

**Priority**: P0 — Revenue blocker
**Files**:
- `app/(main)/pricing/page.tsx` — wire the button
- `app/api/payments/topup/route.ts` — fix redirect URL
- New file: `app/(main)/dashboard/page.tsx` already works as landing; OR redirect topup success to `/pricing`

### Problem

Two issues:

1. **`handleTopUp`** in `app/(main)/pricing/page.tsx` (line 53) is `console.log`:
   ```typescript
   // TODO: Implement top-up checkout flow
   console.log("Top up:", credits, "credits for", price);
   ```

2. **Topup success URL** in `app/api/payments/topup/route.ts` (line 55) redirects to `/wallet` which doesn't exist:
   ```typescript
   successUrl: `${appUrl}/wallet?success=true`,
   cancelUrl: `${appUrl}/wallet?canceled=true`,
   ```

### Solution

**Part A — Wire `handleTopUp` in pricing page** (`app/(main)/pricing/page.tsx`):

The hook `useTopup` already exists at `hooks/use-stripe.ts` and is fully implemented. Just import and use it.

```typescript
// Add import at top:
import { useSubscription, useTopup } from "@/hooks/use-stripe";

// Inside PricingContent(), add:
const { topup, isLoading: topupLoading, error: topupError } = useTopup();

// Replace handleTopUp (lines 45-55):
const handleTopUp = async (credits: number, price: number) => {
  const session = await authClient.getSession();
  if (!session.data?.user) {
    router.push("/login");
    return;
  }

  // price comes in dollars, useTopup expects cents
  await topup(price * 100);
};

// Update error display (line 57):
const displayError = subscribeError || topupError || cancelMessage;

// Update PricingSection isLoading prop (line 108):
isLoading={isLoading || topupLoading}
```

**Part B — Fix redirect URLs** (`app/api/payments/topup/route.ts`):

Change the success/cancel URLs from `/wallet` to `/dashboard` (lines 55-56):

```typescript
// Before:
successUrl: `${appUrl}/wallet?success=true`,
cancelUrl: `${appUrl}/wallet?canceled=true`,

// After:
successUrl: `${appUrl}/dashboard?topup=success`,
cancelUrl: `${appUrl}/pricing?canceled=true`,
```

**Part C — Show topup success toast on dashboard** (`app/(main)/dashboard/page.tsx`):

This is optional for v1. The Dashboard is a server component, so showing a toast based on `?topup=success` would require either:
- A simple client wrapper that reads searchParams and shows a toast, or
- Leaving it as-is (user just lands on dashboard after payment — acceptable for launch)

Recommendation: **Skip Part C for now**. The redirect to `/dashboard` is sufficient — user sees their updated credit balance.

### Acceptance Criteria

- [ ] "Add Credits" buttons on pricing page trigger Stripe checkout
- [ ] After successful topup payment, user lands on `/dashboard` (not 404)
- [ ] After canceled topup, user returns to `/pricing` with cancel message
- [ ] Loading state shows while checkout session is being created
- [ ] `bun run check` passes

---

## Task 4: Implement Free-tier Watermark

**Priority**: P1 — Business integrity
**File**: `app/api/avatars/[id]/download/route.ts`

### Problem

Lines 72-78 — watermark function is a placeholder that returns the original buffer:

```typescript
async function applyWatermark(buffer: Buffer): Promise<Buffer> {
  // Placeholder: return original buffer
  console.log("[Download] Watermark applied (placeholder)");
  return buffer;
}
```

Free-tier users get clean unwatermarked images, undermining the paid tiers' value.

### Solution

Use `sharp` to composite a semi-transparent text watermark. The `sharp` package is already installed and used in this file (via `resizeImage` import).

Replace the `applyWatermark` function:

```typescript
import sharp from "sharp";

async function applyWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width || 512;
  const height = metadata.height || 512;

  // Create a text watermark SVG overlay
  const fontSize = Math.max(Math.round(width * 0.06), 16);
  const watermarkSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .watermark {
          fill: rgba(255, 255, 255, 0.35);
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
          font-weight: bold;
        }
      </style>
      <text x="50%" y="92%" text-anchor="middle" class="watermark">PNGTuberMaker</text>
    </svg>
  `);

  return image
    .composite([{ input: watermarkSvg, gravity: "south" }])
    .png()
    .toBuffer();
}
```

This adds a semi-transparent "PNGTuberMaker" text at the bottom of the image. The font size scales with image width (6% of width, minimum 16px).

### Design Decisions

- **Position**: Bottom center — doesn't obscure the character's face
- **Opacity**: 35% white — visible but not aggressive
- **Scaling**: Font size = 6% of image width, so it looks proportional at any size
- **Font**: Arial fallback — safe for server-side SVG rendering in sharp

### Acceptance Criteria

- [ ] Free-tier downloads have visible "PNGTuberMaker" watermark at bottom
- [ ] Start/Pro tier downloads have NO watermark (existing behavior, just verify)
- [ ] Watermark scales correctly at 512px size
- [ ] `bun run check` passes
- [ ] `bun run build` passes

---

## Task 5: Fix Mock Adapter Relative URLs

**Priority**: P1 — Dev workflow broken
**File**: `lib/services/generation/mock-adapter.ts`

### Problem

Lines 18-27 — mock images are relative paths:

```typescript
const MOCK_CHARACTER_IMAGES = [
  "/images/showcase/1.WEBP",
  "/images/showcase/2.WEBP",
  ...
];
```

When `POST /api/avatars/[id]/select` runs, it calls `fetch(selectedImageUrl)`. Server-side `fetch()` with a relative URL has no host, so it fails. The full generate → select → R2 upload pipeline is broken in dev mode.

### Solution

Prefix the mock URLs with the app's base URL:

```typescript
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

const MOCK_CHARACTER_IMAGES = [
  "/images/showcase/1.WEBP",
  "/images/showcase/2.WEBP",
  "/images/showcase/3.WEBP",
  "/images/showcase/4.WEBP",
  "/images/showcase/5.WEBP",
  "/images/showcase/6.WEBP",
  "/images/showcase/7.WEBP",
  "/images/showcase/8.WEBP",
];
```

Then in both `generateCharacter` and `generateExpression`, prepend the base URL when returning:

```typescript
// In generateCharacter:
const candidates = shuffle(MOCK_CHARACTER_IMAGES).slice(0, 4);
const baseUrl = getBaseUrl();
return {
  status: "completed",
  images: candidates.map((img) => `${baseUrl}${img}`),
};

// In generateExpression:
const mockImages = shuffle(MOCK_CHARACTER_IMAGES);
const baseUrl = getBaseUrl();
return {
  status: "completed",
  imageUrl: `${baseUrl}${mockImages[0] ?? "/images/showcase/1.WEBP"}`,
};
```

### Acceptance Criteria

- [ ] `bun run dev` with `GENERATION_ADAPTER=mock` (or no env var)
- [ ] Full create flow works: generate → select candidate → avatar saved with R2 keys
- [ ] Expression generation also works with mock adapter
- [ ] `bun run check` passes

---

## Task 6: Convert /avatars Page to Server Component

**Priority**: P1 — Auth race condition
**File**: `app/(main)/avatars/page.tsx`

### Problem

The page is a `"use client"` component that checks auth in a `useEffect`:

```typescript
authClient.getSession().then((session) => {
  if (!session) {
    router.push("/login");
  } else {
    fetchAvatars();
  }
});
```

This causes:
1. Page shell renders before auth check completes (loading flash)
2. Unauthenticated users briefly see the page before redirect
3. Inconsistent with `/dashboard` and `/create` which use server-side auth

### Solution

Convert to a server component that fetches data directly (same pattern as Dashboard after Task 1 fix).

```typescript
// Remove "use client"
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import AvatarGrid from "@/components/dashboard/AvatarGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

interface Avatar {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  expressionCount: number;
  createdAt: string;
}

async function getUserAvatars(userId: string): Promise<Avatar[]> {
  try {
    const db = getDatabase();
    const userAvatars = await db
      .select({
        id: avatars.id,
        name: avatars.name,
        thumbnailUrl: avatars.thumbnailUrl,
        createdAt: avatars.createdAt,
      })
      .from(avatars)
      .where(and(eq(avatars.userId, userId), eq(avatars.status, "completed")))
      .orderBy(desc(avatars.createdAt));

    const result: Avatar[] = [];
    for (const a of userAvatars) {
      const exprCount = await db
        .select({ count: count() })
        .from(avatarExpressions)
        .where(eq(avatarExpressions.avatarId, a.id));

      result.push({
        id: a.id,
        name: a.name,
        thumbnailUrl: a.thumbnailUrl,
        expressionCount: exprCount[0]?.count ?? 0,
        createdAt: a.createdAt?.toISOString() ?? "",
      });
    }
    return result;
  } catch {
    return [];
  }
}

export default async function AvatarsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const avatarList = await getUserAvatars(session.user.id);

  return (
    // ... same JSX as current, but use avatarList instead of avatars state
    // Remove all useState/useEffect/useRouter/loading state
  );
}
```

Keep the existing JSX structure, just remove all client-side state management. The page renders fully on the server with data already loaded.

### Acceptance Criteria

- [ ] `/avatars` page renders without loading flash
- [ ] Unauthenticated users are immediately redirected to `/login` (no flash)
- [ ] Avatar list displays correctly
- [ ] Empty state ("No avatars yet") still works
- [ ] "Create New" link still works
- [ ] `bun run check` passes
- [ ] `bun run build` passes

---

## Execution Order

```
Task 1 (Dashboard fetch fix)     ─── can start immediately
Task 5 (Mock adapter URLs)       ─── can start immediately
Task 4 (Watermark)               ─── can start immediately
Task 6 (Avatars server component) ── can start immediately
Task 2 (Add Expression button)   ─── can start immediately
Task 3 (Top-up flow)             ─── can start immediately
```

All 6 tasks are independent — they can be parallelized across engineers.

**Recommended pairing**:
- Backend engineer: Tasks 1, 4, 5 (~1.5 hours)
- Frontend engineer: Tasks 2, 3, 6 (~2 hours)

## Verification

After all tasks are complete:

```bash
bun run check        # Zero errors
bun run build        # Clean build
bun run dev          # Manual verification:
```

Manual test checklist:
- [ ] Log in → Dashboard shows credits, subscription, recent avatars
- [ ] Navigate to /avatars → no loading flash, list shows
- [ ] Navigate to /avatars/[id] → "Add Expression" dropdown works
- [ ] /create flow → generate → select → expressions → download (mock adapter)
- [ ] Free-tier download has watermark
- [ ] Pricing page → "Add Credits" opens Stripe checkout
- [ ] After top-up success → lands on /dashboard (not 404)
