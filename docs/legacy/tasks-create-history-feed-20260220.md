# Create Page — Server-Persisted History Feed

> Assignee: Frontend Engineer
> Branch: `feat/create-history-feed`
> Dependencies: Current `main` branch (create page redesign already merged)
> Estimated scope: 2 files to modify, 1 file to create

---

## Goal

Make the `/create` page load generation history from the server on mount, so users see their past generations (with correct card states and action buttons) even after refreshing or switching devices. Midjourney-style feed: newest first, different actions per status.

---

## Before You Start

1. Pull latest from `main`
2. Run `bun install && bun run dev`
3. Visit `/create` (logged in) — you'll see the generator form + empty feed
4. Generate an avatar via the form, verify it works end-to-end
5. Refresh the page — the feed is empty (current bug, this task fixes it)

---

## Architecture Overview

```
Page mount
    │
    ▼
GET /api/avatars/history?limit=20    ◄── NEW endpoint
    │
    ▼
Returns avatars with ALL statuses + candidateImages + expressions
    │
    ▼
Hook converts API response → Generation[] (same shape as in-memory feed)
    │
    ▼
Feed renders with correct card types per status
```

The `avatars` table already stores everything we need:

| DB field | Used for |
|----------|----------|
| `id` | Generation ID (use as `generation.id`) |
| `prompt`, `style` | Card header |
| `status` | Card type: `generating`/`selecting`/`completed`/`failed` |
| `candidateImages` (jsonb) | 4 candidate thumbnails |
| `baseImageUrl` | Selected base image |
| `createdAt` | Relative timestamp |
| `avatarExpressions` (relation) | Expression thumbnails in actions panel |

**No schema changes needed. No migrations.**

---

## Task 1: Create `GET /api/avatars/history` endpoint

### File: `app/api/avatars/history/route.ts` (NEW)

This is separate from the existing `GET /api/avatars` (which serves the dashboard and only returns `completed` avatars with minimal fields). The history endpoint returns richer data for the create page.

### Spec

```
Auth: Required (401 if no session)
Method: GET
Query: ?limit=N (default 20, max 50)
```

### Implementation

```typescript
import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatarExpressions, avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? Math.max(1, Math.min(50, Number(limitParam)))
      : 20;

    const db = getDatabase();

    // Fetch recent avatars (ALL statuses, not just completed)
    const userAvatars = await db
      .select({
        id: avatars.id,
        name: avatars.name,
        prompt: avatars.prompt,
        style: avatars.style,
        status: avatars.status,
        candidateImages: avatars.candidateImages,
        baseImageUrl: avatars.baseImageUrl,
        createdAt: avatars.createdAt,
      })
      .from(avatars)
      .where(eq(avatars.userId, session.user.id))
      .orderBy(desc(avatars.createdAt))
      .limit(limit);

    // Batch-fetch expressions for all completed avatars
    const completedIds = userAvatars
      .filter((a) => a.status === "completed")
      .map((a) => a.id);

    let expressionMap: Record<
      string,
      { id: string; type: string; status: string; imageUrl: string | null }[]
    > = {};

    if (completedIds.length > 0) {
      const allExpressions = await db
        .select({
          id: avatarExpressions.id,
          avatarId: avatarExpressions.avatarId,
          type: avatarExpressions.type,
          status: avatarExpressions.status,
          imageUrl: avatarExpressions.imageUrl,
        })
        .from(avatarExpressions)
        .where(
          // Use inArray for batch query
          // import { inArray } from "drizzle-orm";
          // inArray(avatarExpressions.avatarId, completedIds)
          //
          // OR if completedIds is small (it will be, <=20), loop is fine too.
          // Pick whichever approach you're comfortable with.
          // The inArray approach is shown in the final code below.
        );

      // Group by avatarId
      for (const expr of allExpressions) {
        if (!expressionMap[expr.avatarId]) {
          expressionMap[expr.avatarId] = [];
        }
        expressionMap[expr.avatarId].push({
          id: expr.id,
          type: expr.type,
          status: expr.status,
          imageUrl: expr.imageUrl,
        });
      }
    }

    // Shape response
    const history = userAvatars.map((a) => ({
      id: a.id,
      name: a.name,
      prompt: a.prompt,
      style: a.style,
      status: a.status,
      candidateImages: a.candidateImages ?? [],
      baseImageUrl: a.baseImageUrl,
      expressions: expressionMap[a.id] ?? [],
      createdAt: a.createdAt?.toISOString() ?? "",
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching avatar history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}
```

**Important**: Use `inArray` from drizzle-orm for the batch expressions query. The pseudocode above shows the idea — the actual import is:

```typescript
import { desc, eq, inArray } from "drizzle-orm";

// Then in the query:
const allExpressions = await db
  .select({ ... })
  .from(avatarExpressions)
  .where(inArray(avatarExpressions.avatarId, completedIds));
```

### Response shape

```json
{
  "history": [
    {
      "id": "avatar-uuid",
      "name": "My PNGTuber",
      "prompt": "A cute anime girl with...",
      "style": "anime",
      "status": "completed",
      "candidateImages": ["url1", "url2", "url3", "url4"],
      "baseImageUrl": "https://r2.../base.png",
      "expressions": [
        { "id": "expr-1", "type": "talking", "status": "completed", "imageUrl": "https://r2.../talking.png" },
        { "id": "expr-2", "type": "happy", "status": "completed", "imageUrl": "https://r2.../happy.png" },
        { "id": "expr-3", "type": "sad", "status": "completed", "imageUrl": "https://r2.../sad.png" }
      ],
      "createdAt": "2026-02-20T10:30:00.000Z"
    },
    {
      "id": "avatar-uuid-2",
      "name": "My PNGTuber",
      "prompt": "Cool cyberpunk boy...",
      "style": "anime",
      "status": "selecting",
      "candidateImages": ["url1", "url2", "url3", "url4"],
      "baseImageUrl": null,
      "expressions": [],
      "createdAt": "2026-02-20T09:15:00.000Z"
    }
  ]
}
```

---

## Task 2: Modify `hooks/use-avatar-generator.ts` — Load history on init

### Changes

Add a `loadHistory()` function and call it during initialization.

### 2a. Add `HistoryItem` type and converter

At the top of the file, add a type for the API response and a function to convert it into the existing `Generation` type:

```typescript
// API response shape from GET /api/avatars/history
interface HistoryItem {
  id: string;
  name: string;
  prompt: string;
  style: string;
  status: string;       // 'generating' | 'selecting' | 'completed' | 'failed'
  candidateImages: string[];
  baseImageUrl: string | null;
  expressions: {
    id: string;
    type: string;
    status: string;
    imageUrl: string | null;
  }[];
  createdAt: string;
}
```

Add a converter function (inside or outside the hook, your choice):

```typescript
function historyItemToGeneration(item: HistoryItem): Generation {
  return {
    id: item.id,                            // Use avatar ID as generation ID
    avatarId: item.id,
    prompt: item.prompt,
    style: item.style as ArtStyle,
    candidateImages: item.candidateImages,
    // DB 'selecting' maps to our UI 'completed' (has candidates, ready to pick)
    status: item.status === "selecting" || item.status === "completed"
      ? "completed"
      : item.status === "failed"
        ? "failed"
        : "generating",
    createdAt: new Date(item.createdAt).getTime(),
  };
}
```

### 2b. Add `loadHistory()` to the hook

Add this function inside `useAvatarGenerator()`, after `fetchBalance`:

```typescript
const loadHistory = useCallback(async () => {
  try {
    const res = await fetch("/api/avatars/history?limit=20");
    if (!res.ok) return;
    const data = await res.json();
    const items: HistoryItem[] = data.history ?? [];

    setState((prev) => {
      // Merge: keep any in-flight generations (that have no avatarId yet),
      // replace everything else with server data
      const inFlightGenerations = prev.generations.filter(
        (g) => g.avatarId === null,
      );
      const historyGenerations = items.map(historyItemToGeneration);

      return {
        ...prev,
        generations: [...inFlightGenerations, ...historyGenerations],
      };
    });
  } catch {
    // Silent fail — history is non-critical
  }
}, []);
```

### 2c. Handle selection restoration for `selecting` / `completed` avatars

When a history item has `status === "selecting"`, it means the user generated candidates but never picked one. The card should show 4 candidates and let them select.

When `status === "completed"` with expressions, the selection panel should pre-populate.

This is handled naturally by the existing `GenerationGroup` component — it already renders candidates for `completed` status and allows selection. The key mapping is:

| DB status | UI `Generation.status` | Card behavior |
|-----------|----------------------|---------------|
| `generating` | `generating` | Skeleton cards (rare — means generation hung) |
| `selecting` | `completed` | 4 candidates, user can click to select |
| `completed` (no expressions) | `completed` | 4 candidates + actions panel (can generate expressions) |
| `completed` (with expressions) | `completed` | 4 candidates + actions panel (shows expressions + download) |
| `failed` | `failed` | Error message |

### 2d. Auto-select for completed avatars with expressions

For history items that are `completed` AND have expressions, auto-set `selected` state so the actions panel shows immediately. Add this to `loadHistory()` after setting generations:

**Do NOT auto-select.** The user will click a candidate to open the panel, same as new generations. The history data is there — expressions will populate when they click.

### 2e. Modify `selectCandidate` to handle history items with expressions

When the user clicks a candidate on a history card that already has expressions (DB `completed` + has expressions), we should pre-populate the `SelectedAvatar.expressions` and `expressionsGenerated` flag.

Change `selectCandidate` to accept an optional expressions array:

```typescript
const selectCandidate = useCallback(
  (generationId: string, index: number, existingExpressions?: ExpressionState[]) => {
    setState((prev) => {
      const gen = prev.generations.find((g) => g.id === generationId);
      if (!gen || !gen.avatarId) return prev;

      if (
        prev.selected?.generationId === generationId &&
        prev.selected.baseSelected
      ) {
        return prev;
      }

      const hasExpressions = existingExpressions && existingExpressions.length > 0;

      return {
        ...prev,
        selected: {
          generationId,
          avatarId: gen.avatarId,
          candidateIndex: index,
          candidateUrl: gen.candidateImages[index] ?? "",
          avatarName:
            prev.selected?.generationId === generationId
              ? prev.selected.avatarName
              : "My PNGTuber",
          expressions: existingExpressions ?? [],
          isSelectingBase: false,
          isGeneratingExpressions: false,
          expressionsGenerated: hasExpressions ?? false,
          baseSelected: hasExpressions ?? false,  // If has expressions, base was already selected
        },
      };
    });
  },
  [],
);
```

### 2f. Store expressions data on Generation for history items

The current `Generation` type doesn't carry expressions. We need a way to pass expression data from history into the select flow. Two options:

**Option A (simpler)**: Add an `expressions` field to the `Generation` interface. This is the recommended approach:

```typescript
export interface Generation {
  id: string;
  avatarId: string | null;
  prompt: string;
  style: ArtStyle;
  candidateImages: string[];
  status: "generating" | "completed" | "failed";
  error?: string;
  createdAt: number;
  // History fields (populated from server, empty for new generations)
  name?: string;
  baseImageUrl?: string | null;
  expressions?: ExpressionState[];   // ◄── ADD THIS
}
```

Update `historyItemToGeneration` to include expressions:

```typescript
function historyItemToGeneration(item: HistoryItem): Generation {
  return {
    id: item.id,
    avatarId: item.id,
    prompt: item.prompt,
    style: item.style as ArtStyle,
    candidateImages: item.candidateImages,
    status:
      item.status === "selecting" || item.status === "completed"
        ? "completed"
        : item.status === "failed"
          ? "failed"
          : "generating",
    createdAt: new Date(item.createdAt).getTime(),
    name: item.name,
    baseImageUrl: item.baseImageUrl,
    expressions: item.expressions.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status as ExpressionState["status"],
      imageUrl: e.imageUrl,
    })),
  };
}
```

**Option B**: Store a separate Map in the hook. More complex, not recommended.

### 2g. Update `generate()` to refresh history after success

After a successful generation, the new avatar is in the DB. Instead of just updating the in-memory placeholder, also call `loadHistory()` to sync the full feed. This ensures the generation ID matches the DB avatar ID:

In the `generate()` success block, after `await fetchBalance()`, add:

```typescript
await loadHistory();
```

This replaces the in-memory placeholder with the server record, giving us correct IDs for subsequent API calls.

### 2h. Expose `loadHistory` and call on mount

Add `loadHistory` to the return object:

```typescript
return {
  state,
  creditBalance,
  fetchBalance,
  loadHistory,     // ◄── ADD
  // ... rest
};
```

---

## Task 3: Modify `components/create/AvatarGenerator.tsx` — Call loadHistory on mount

### Changes

```typescript
useEffect(() => {
  fetchBalance();
  loadHistory();    // ◄── ADD
}, [fetchBalance, loadHistory]);
```

Destructure `loadHistory` from the hook:

```typescript
const {
  state,
  creditBalance,
  fetchBalance,
  loadHistory,      // ◄── ADD
  updatePrompt,
  // ...
} = useAvatarGenerator();
```

---

## Task 4: Modify `components/create/GenerationGroup.tsx` — Pass expressions on select

When the user clicks a candidate on a history card, pass existing expressions:

### Changes to `GenerationGroupProps`

The `onSelectCandidate` signature needs to support the optional expressions:

```typescript
interface GenerationGroupProps {
  generation: Generation;
  selected: SelectedAvatar | null;
  creditBalance: number | null;
  onSelectCandidate: (generationId: string, index: number, existingExpressions?: ExpressionState[]) => void;
  // ... rest unchanged
}
```

### Changes to the `CandidateCard` `onSelect` callback

```tsx
<CandidateCard
  key={url}
  imageUrl={url}
  index={i}
  isSelected={isThisGroupSelected && selected.candidateIndex === i}
  disabled={isThisGroupSelected && selected.baseSelected}
  onSelect={() => onSelectCandidate(generation.id, i, generation.expressions)}
/>
```

This passes expressions from the Generation (populated for history items, empty for new generations) into the select handler.

### Show completed status for history items

For history items with `baseImageUrl` (already selected + completed), the card should indicate which candidate was selected. But since the DB doesn't store `selectedIndex`, we can't highlight the exact candidate. This is fine — all 4 candidates remain clickable for re-selection reference. The `baseSelected` flag will be true (set in Task 2e based on `hasExpressions`), which disables candidate switching.

### Add import for `ExpressionState`

```typescript
import type { ExpressionState, Generation, SelectedAvatar } from "@/hooks/use-avatar-generator";
```

---

## Card State Matrix (for QA reference)

| History status | candidateImages | expressions | Card shows | Actions panel |
|---------------|-----------------|-------------|-----------|---------------|
| `generating` | `[]` | `[]` | 4 skeleton cards | None |
| `selecting` | `[url, url, url, url]` | `[]` | 4 candidate cards (clickable) | Click candidate → name + "Generate Expressions" + size + download |
| `completed` + 0 expressions | `[url, url, url, url]` | `[]` | 4 candidate cards (clickable) | Click candidate → name + "Generate Expressions" + size + download |
| `completed` + 3 expressions | `[url, url, url, url]` | `[{talking}, {happy}, {sad}]` | 4 candidate cards (selection locked) | Click candidate → name + expression thumbnails + size + download |
| `failed` | `[]` | `[]` | Error message | None |

---

## Edge Cases to Handle

### 1. Expired Midjourney CDN URLs

For old `selecting` status avatars, the `candidateImages` URLs point to Midjourney's CDN which may have expired (24-48h TTL). The cards will show broken images.

**Handle**: In `CandidateCard`, add an `onError` handler to the `<img>`:

```tsx
<img
  src={imageUrl}
  alt={`Option ${index + 1}`}
  className="..."
  onError={(e) => {
    (e.target as HTMLImageElement).src = "";
    (e.target as HTMLImageElement).classList.add("bg-gray-200");
  }}
/>
```

This gracefully degrades to a gray placeholder. No text needed — the user will understand the old candidates expired.

### 2. Duplicate generations on re-mount

`loadHistory()` replaces non-in-flight generations, so re-mounting won't create duplicates. The merge logic (`filter by avatarId === null`) ensures in-flight generations are preserved.

### 3. Concurrent generate + loadHistory race

If user triggers `generate()` and `loadHistory()` finishes first, the in-memory placeholder (with `avatarId === null`) won't be overwritten by history. When `generate()` completes, it calls `loadHistory()` which replaces the placeholder with the real record.

---

## Verification

1. `bun run check` — no lint errors
2. `bun run build` — no broken imports
3. Manual testing:
   - [ ] `/create` logged out → redirects to `/login`
   - [ ] `/create` logged in with no history → empty feed, form works
   - [ ] Generate a new avatar → skeleton cards → real images appear
   - [ ] Refresh page → generation appears in feed with correct status
   - [ ] Click a candidate on history card → actions panel opens
   - [ ] "Generate Expressions" on a `selecting` history card → works correctly
   - [ ] Avatar with expressions loaded from history → expressions show in panel, candidate switching disabled
   - [ ] Download ZIP on a history card → file downloads
   - [ ] Generate new avatar → appears at top, history cards below
   - [ ] Old history card with expired CDN images → shows gray placeholder, not broken image icon

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `app/api/avatars/history/route.ts` | **CREATE** | New endpoint: returns all-status avatars + expressions |
| `hooks/use-avatar-generator.ts` | **MODIFY** | Add `loadHistory()`, update types, modify `selectCandidate` |
| `components/create/AvatarGenerator.tsx` | **MODIFY** | Call `loadHistory()` on mount |
| `components/create/GenerationGroup.tsx` | **MODIFY** | Pass expressions on candidate select |
