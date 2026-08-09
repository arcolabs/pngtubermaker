# Engineer B — Frontend Tasks

> Assignee: Frontend Engineer
> Dependencies: Wait for skeleton commit from lead (Dashboard shell, Create Flow stepper, API endpoints)
> Reference docs: [mvp-user-flow](./mvp-user-flow-20260219.md), [dev-plan](./dev-plan-20260219.md)

---

## Before You Start

1. Pull latest from `main`
2. Run `bun install && bun run dev`
3. Visit `/create` — you should see the stepper skeleton working with mock data
4. Visit `/dashboard` — may be empty shell, you'll build it out
5. Read the [MVP User Flow doc](./mvp-user-flow-20260219.md) — it has ASCII wireframes for every page

---

## Design System Reference

**Theme**: Light theme, cyan primary

```tsx
// Backgrounds
className="bg-base-100"     // Main page background
className="bg-base-200"     // Cards, elevated surfaces

// Text
className="text-primary"    // Brand cyan (#06b6d4)
className="text-base-content" // Normal text

// Buttons
className="btn btn-primary"  // Cyan background
className="btn btn-outline"  // Bordered, no fill
className="btn btn-ghost"    // No border, no fill

// Cards
className="card bg-base-200 shadow-sm"

// Glass effect (for special cards)
className="border border-white/10 bg-white/5 backdrop-blur-xl"
```

**Icons**: Use `lucide-react` (already installed)

```tsx
import { Plus, Download, Trash2, CreditCard, Sparkles } from "lucide-react";
```

---

## Your Tasks

### Task 3.1: Copy Reusable Hooks from thumb-free

**Priority**: P2
**Estimate**: ~1h

Copy these 4 hooks from `thumb-free/components/ai-image-generator/hooks/` to `hooks/` in our project:

| Source | Target | Changes Needed |
|--------|--------|---------------|
| `useAutoResizeTextarea.ts` | `hooks/use-auto-resize-textarea.ts` | None — copy as-is |
| `usePersistentState.ts` | `hooks/use-persistent-state.ts` | Change storage keys prefix from `ai-generator-` to `pngtuber-` |
| `useImageUpload.ts` | `hooks/use-image-upload.ts` | Update API endpoint from `/api/images/upload-proxy` to `/api/images/upload` |

Note: `useAIImageGeneration` will be forked by the lead as `useGeneration` — don't copy this one.

Create `hooks/index.ts` to export all hooks.

**Acceptance criteria**:
- [ ] All 3 hooks importable from `@/hooks`
- [ ] `usePersistentState` uses `pngtuber-` prefix for IndexedDB keys
- [ ] No TypeScript errors
- [ ] `bun run check` passes

---

### Task 3.2: Dashboard Page

**Priority**: P2
**Estimate**: ~4h
**Wireframe**: See [mvp-user-flow Section 6](./mvp-user-flow-20260219.md#6-dashboard-详细设计)

**New files**:
```
app/(main)/dashboard/page.tsx
components/dashboard/CreditBar.tsx
components/dashboard/AvatarGrid.tsx
components/dashboard/AvatarCard.tsx
components/dashboard/UsageStats.tsx
components/dashboard/EmptyState.tsx
```

#### Page Layout

```tsx
// app/(main)/dashboard/page.tsx
// Uses the existing (main) layout (Header + Footer)

export default async function DashboardPage() {
  // Server component — fetch initial data
  // Redirect to /login if not authenticated

  return (
    <div className="min-h-screen bg-base-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <CreditBar />
        <QuickAction />    {/* "Create New PNGTuber" CTA */}
        <AvatarGrid />     {/* Recent avatars */}
        <UsageStats />     {/* Credits used this month */}
      </div>
    </div>
  );
}
```

#### Component Specs

**CreditBar.tsx**
```
┌────────────────────────────────────────────────────────┐
│ 🪙 8,450 credits    |    Plan: Start    [Top Up] [Upgrade] │
└────────────────────────────────────────────────────────┘

- Fetch from GET /api/credits/balance
- "Top Up" → link to /pricing#topup
- "Upgrade" → link to /pricing (only show if not Pro)
- Plan badge: "Free" (gray), "Start" (cyan), "Pro" (gradient)
```

**AvatarGrid.tsx**
```
- Fetch from GET /api/avatars
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Last item is always [+ Create New] card
- If empty → show EmptyState instead
- Max 6 avatars shown, "View All →" link if more
```

**AvatarCard.tsx**
```
Props: { avatar: { id, name, thumbnailUrl, expressionCount, createdAt } }

- Thumbnail image (256x256, rounded)
- Name below
- "4 expressions" subtitle
- Date (relative: "2 hours ago", "Feb 19")
- Click → navigate to /avatars/[id]
- Hover: subtle scale + shadow
```

**UsageStats.tsx**
```
Credits used: 3,550 / 12,000
████████░░░░░░░░░░░░  29%
Avatars created: 3    Resets: Mar 19

- Progress bar using DaisyUI: <progress className="progress progress-primary" />
- "Resets" shows next subscription renewal date
- Free tier: show "500 / 500 (Welcome credits)" or similar
```

**EmptyState.tsx**
```
- Shown when user has 0 avatars
- Large illustration or icon (Sparkles from lucide)
- "Create your first PNGTuber"
- "Describe your character and we'll generate a complete expression pack in minutes"
- [✨ Create PNGTuber] button → /create
```

**Acceptance criteria**:
- [ ] Redirects to /login if not authenticated
- [ ] Real data from API (credits, avatars)
- [ ] Empty state works for new users
- [ ] Responsive on mobile (375px)
- [ ] All links work (create, pricing, avatar detail)
- [ ] `bun run check` passes

---

### Task 3.4: My Avatars Pages

**Priority**: P2
**Estimate**: ~3h
**Wireframe**: See [mvp-user-flow Section 5](./mvp-user-flow-20260219.md#5-my-avatars-page)

**New files**:
```
app/(main)/avatars/page.tsx
app/(main)/avatars/[id]/page.tsx
components/avatars/AvatarDetailView.tsx
components/avatars/ExpressionGrid.tsx
components/avatars/DeleteAvatarModal.tsx
```

#### List Page (/avatars)

```tsx
// Very similar to Dashboard's AvatarGrid but full-page
// Show ALL avatars (not just 6)
// Infinite scroll or pagination

// Grid layout: same as Dashboard
// "Create New" card at the end
// Empty state if no avatars
```

#### Detail Page (/avatars/[id])

```
← Back to My Avatars

Luna                                    Created Feb 19, 2026

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Idle    │  │ Talking  │  │  Happy   │  │   Sad    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

[📥 Download ZIP]  [➕ Add Expression — 200 🪙]  [🗑 Delete]

── Generation Details ──
Prompt: "A cute anime girl with long silver hair..."
Style: Anime
Credits used: 1,100
```

**Key interactions**:
- **Download ZIP**: Call `GET /api/avatars/[id]/download?format=zip&size=1080`
  - Show size selector dropdown (512/1080/2160) based on user tier
  - Button shows spinner during download
- **Add Expression**: Open a small modal/dropdown to pick expression type
  - Only show types not already generated
  - Confirm: "Generate Sad expression? This will use 200 credits"
  - On confirm: POST to expression API → show loading → refresh
- **Delete**: Show confirmation modal
  - "Delete Luna? This action cannot be undone. Credits will not be refunded."
  - On confirm: `DELETE /api/avatars/[id]` → redirect to /avatars

**Acceptance criteria**:
- [ ] List page shows all user avatars
- [ ] Detail page shows all expressions
- [ ] Download triggers real file download
- [ ] Add Expression flow works (with credit confirmation)
- [ ] Delete requires confirmation
- [ ] Back navigation works
- [ ] 404 page if avatar doesn't exist or not owned

---

### Task 3.5: Header Update

**Priority**: P2
**Estimate**: ~2h
**File changes**: `components/layout/Header.tsx`

```
Logged out:
PNGTuberMaker    Pricing    [Login]  [Get Started Free]

Logged in:
PNGTuberMaker    Dashboard    Pricing    🪙 8,450    [Avatar ▾]
                                                       ├── My Avatars
                                                       └── Log Out
```

**Implementation**:
```tsx
// Use authClient.useSession() to detect login state
// If logged in:
//   - Show "Dashboard" nav link
//   - Show credit balance (fetch from /api/credits/balance)
//   - Show user avatar dropdown (use DaisyUI dropdown component)
//   - "Get Started" button → changes to "Create" button → /create
// If logged out:
//   - Show "Login" and "Get Started Free" buttons
//   - No Dashboard link
//   - No credit display

// Credit display: use SWR or simple useState+useEffect to fetch
// Revalidate on window focus (credits may change in other tabs)
```

**Mobile menu**:
```
// Hamburger menu on mobile (< 768px)
// DaisyUI drawer or dropdown
// Same items as desktop, stacked vertically
```

**Acceptance criteria**:
- [ ] Logged-out header matches design
- [ ] Logged-in header shows credit balance
- [ ] Dropdown menu works (My Avatars, Log Out)
- [ ] Mobile hamburger menu
- [ ] Credit balance updates after generation
- [ ] `bun run check` passes

---

### Task 3.6: Pricing Page Update

**Priority**: P2
**Estimate**: ~3h
**File changes**: `app/(main)/pricing/page.tsx`, `components/pricing/`

**Changes from current**:

1. **Tier cards**: Change "X generations/month" to "X credits/month"
   ```
   Free:  500 credits/month
   Start: 12,000 credits/month ($12 value)
   Pro:   50,000 credits/month ($50 value)
   ```

2. **Feature lists**: Update to reflect credit system
   ```
   Start features:
   - 12,000 credits/month ($12 value — 1.33x)
   - No watermark
   - HD export (1080p)
   - Basic expression pack
   - Email support

   Pro features:
   - 50,000 credits/month ($50 value — 1.67x)
   - 4K export
   - All expressions & animations
   - Priority generation queue
   - Commercial license
   - Priority support
   ```

3. **New section**: Credit Top-Up Packages (below subscription tiers)
   ```
   ── Need More Credits? ──

   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Starter  │  │  Value   │  │  Power   │
   │ 5,000 🪙 │  │ 12,000🪙 │  │ 35,000🪙 │
   │   $5     │  │   $10    │  │   $25    │
   │          │  │ +20% bonus│ │ +40% bonus│
   │  [Buy]   │  │  [Buy]   │  │  [Buy]   │
   └──────────┘  └──────────┘  └──────────┘

   Credits purchased never expire.
   ```

4. **CTA buttons**:
   - Free: "Get Started Free" (if not logged in) or "Current Plan" badge
   - Start/Pro: "Subscribe" → Stripe checkout (existing flow)
   - Top-up: "Buy" → Stripe checkout for one-time payment

5. **Current plan indicator**: If logged in, show "Current Plan" badge on active tier

**Acceptance criteria**:
- [ ] Credit amounts displayed correctly
- [ ] Yearly toggle still works (20% discount)
- [ ] Top-up section added
- [ ] Subscribe buttons trigger Stripe checkout
- [ ] Current plan badge shown for logged-in users
- [ ] Responsive layout
- [ ] `bun run check` passes

---

## Coding Patterns

### Data Fetching (Client Component)

```tsx
"use client";
import { useEffect, useState } from "react";

function useCreditBalance() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits/balance")
      .then(res => res.json())
      .then(setBalance)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { balance, loading };
}
```

### Auth-Gated Pages (Server Component)

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // ... render page
}
```

### DaisyUI Component Examples

```tsx
// Modal
<dialog id="delete_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Delete Avatar?</h3>
    <p className="py-4">This action cannot be undone.</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">Cancel</button>
      </form>
      <button className="btn btn-error" onClick={handleDelete}>Delete</button>
    </div>
  </div>
</dialog>

// Dropdown
<div className="dropdown dropdown-end">
  <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
    <img src={user.image} alt="" className="w-8 rounded-full" />
  </div>
  <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box w-52 p-2 shadow">
    <li><Link href="/avatars">My Avatars</Link></li>
    <li><button onClick={signOut}>Log Out</button></li>
  </ul>
</div>

// Progress bar
<progress className="progress progress-primary w-full" value={29} max={100} />
```

---

## Questions? Ask the Lead

- API response types → check the API route files for return shapes
- Auth patterns → check existing `app/api/payments/subscribe/route.ts` for reference
- Design ambiguity → refer to [mvp-user-flow](./mvp-user-flow-20260219.md) wireframes
- If a component exists in `components/ui/` → reuse it, don't recreate
