# Reference Sheet Implementation Plan

> **Target executor:** MiniMax-M2.7 via `minimax-task` agent. Execute top-to-bottom; each task has exact file paths, exact code, and verification commands. Run `bun run check` after each task.

**Goal:** Ship a "Character Reference Sheet" feature — a one-off 1024×1024 img2img generation (three-view + expressions + color palette + world-setting blurb) tied to a completed avatar, surfaced via `/create` candidate-card CTA and `/avatars/[id]` detail page, with Twitter/Discord share.

**Architecture:** Thin addition to the existing avatar flow. No new table. Three new columns on `avatars`. One new `POST` route. Two new generic UI components (`ImageActionIcons`, `ShareButtons`) and two feature cards (`ReferenceSheetResultCard` for `/create`, `ReferenceSheetCard` for the detail page). Primary image path: `GptImageAdapter.postEdit(originalBaseImageUrl, REFERENCE_SHEET_PROMPT)` → sharp watermark → R2 → DB update. Credits are charged atomically via `consumeWithRecord` and refunded via `refundWithUpdate` on any downstream failure.

**Tech Stack:** Next.js 16 App Router, Drizzle ORM (Neon Postgres), better-auth, sharp@0.34.5, Cloudflare R2, Tailwind v4 + DaisyUI v5, lucide-react.

---

## Pre-flight context (read before editing)

- **Spec doc:** `docs/reference-sheet-20260423.md` (already written — single source of truth for business rules)
- **DB schema:** `database/schema.ts:167-201` (avatars table)
- **Credits (two files, both have TASK_COSTS):**
  - `lib/services/credits.ts:16-20` — general helpers (`consumeCredits`, `refundCredits`)
  - `lib/services/credits-transaction.ts:15-19` — transactional helpers (`consumeWithRecord`, `refundWithUpdate`) — **used by API routes**
- **R2 helpers:** `lib/services/storage.ts` — `uploadImageToR2(buffer, key, contentType)`, `generateAvatarKey(userId, avatarId, type, filename?)`
- **AI adapter:** `lib/services/generation/gpt-image-adapter.ts` — `postEdit` is file-local at `:105`; exposed only via `GptImageAdapter` class methods. GPT-Image-2 edit is **hardcoded to 1024×1024**.
- **Reference API route pattern:** `app/api/avatars/[id]/packs/route.ts` (auth + rate-limit + `consumeWithRecord` + `refundWithUpdate` + `after()` background work)
- **Reference UI pattern for `/create` result card:** `components/create/ExpressionResultsCard.tsx`
- **Detail page:** `components/avatars/AvatarDetailClient.tsx` — Live Preview section ends before Expressions section; Expressions section Pack buttons at `:852-891`
- **Candidate card:** `components/create/CandidateCard.tsx` — already has a hover-only Preview icon top-left; Download icon will mirror this pattern top-right-ish
- **GenerationGroup:** `components/create/GenerationGroup.tsx:405-478` — 3 buttons shown when a candidate is selected: `Generate Expressions` / `Download` / `Regenerate`. Download must be removed and replaced by `Generate Character Sheet`.

**Conventions the project uses (follow them):**
- External R2 `<img>` tags: prefix with `{/* biome-ignore lint/performance/noImgElement: external R2 URLs */}`
- DaisyUI classes (`btn`, `btn-primary`) mixed with Tailwind gradient utilities — match surrounding file
- `cn()` from `@/lib/utils`
- Never write tests (project has no test runner — only `bun run check` = Biome)
- Never add emoji to strings/comments unless quoting existing code

---

## Task 1: DB schema — add 3 columns to `avatars`

**Files:**
- Modify: `database/schema.ts:167-201` (avatars table)
- Run: `bun run db:generate` then `bun run db:push`

- [ ] **Step 1: Edit schema**

In `database/schema.ts`, inside the `avatars` table definition, insert the 3 columns **after line 193** (`metadata: jsonb("metadata"),`) and before `createdAt`:

```ts
    referenceSheetUrl: text("reference_sheet_url"),
    referenceSheetR2Key: text("reference_sheet_r2_key"),
    referenceSheetGeneratedAt: timestamp("reference_sheet_generated_at"),
```

- [ ] **Step 2: Generate and push migration**

```bash
bun run db:generate
bun run db:push
```

Expected: `db:generate` prints a migration file name under `database/migrations/`; `db:push` completes with no errors.

- [ ] **Step 3: Verify**

```bash
bun run check
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add database/schema.ts database/migrations
git commit -m "feat(schema): add reference_sheet columns to avatars"
```

---

## Task 2: Register `reference_sheet` in TASK_COSTS (both files)

**Files:**
- Modify: `lib/services/credits.ts:16-20`
- Modify: `lib/services/credits-transaction.ts:15-19`

- [ ] **Step 1: Update `lib/services/credits.ts:16-20`**

```ts
export const TASK_COSTS = {
  avatar_generation: 300,
  expression_edit: 200,
  hd_upscale: 100,
  reference_sheet: 200,
} as const;
```

- [ ] **Step 2: Update `lib/services/credits-transaction.ts:15-19`** (identical edit)

```ts
export const TASK_COSTS = {
  avatar_generation: 300,
  expression_edit: 200,
  hd_upscale: 100,
  reference_sheet: 200,
} as const;
```

- [ ] **Step 3: Verify**

```bash
bun run check
```

- [ ] **Step 4: Commit**

```bash
git add lib/services/credits.ts lib/services/credits-transaction.ts
git commit -m "feat(credits): add reference_sheet task cost (200)"
```

---

## Task 3: Expose `postEdit` from GPT-Image adapter + reference-sheet prompt

`postEdit` is currently a file-local function in `gpt-image-adapter.ts`. We need a class method so the API route can call it without importing internals.

**Files:**
- Modify: `lib/services/generation/gpt-image-adapter.ts` (add public method)
- Create: `lib/services/generation/reference-sheet-prompt.ts`

- [ ] **Step 1: Create prompt constant file**

`lib/services/generation/reference-sheet-prompt.ts`:

```ts
export const REFERENCE_SHEET_PROMPT = `Based on this character and background, create an official-style character reference sheet.
Include three views: front, side, and back. Add facial expression variations.
Break down and show detailed parts of clothing and equipment. Add a color palette.
Include a brief description of the world setting. Overall, use an organized layout with white background, illustration style.`;
```

- [ ] **Step 2: Add public method to `GptImageAdapter`**

In `lib/services/generation/gpt-image-adapter.ts`, inside the `GptImageAdapter` class (after `generateExpression`, before the closing brace — around `:185`), add:

```ts
  /**
   * Raw edit: run a custom prompt against a reference image.
   * Used by reference-sheet generation where no prompt builder applies.
   */
  async editWithPrompt(
    imageUrl: string,
    prompt: string,
  ): Promise<string | null> {
    console.log("[GptImage] editWithPrompt:", prompt.slice(0, 80));
    return callWithRetry("custom-edit", () => postEdit(imageUrl, prompt));
  }
```

(`callWithRetry` is already defined earlier in the same file — reuse it.)

- [ ] **Step 3: Verify**

```bash
bun run check
```

- [ ] **Step 4: Commit**

```bash
git add lib/services/generation/
git commit -m "feat(gen): add REFERENCE_SHEET_PROMPT and editWithPrompt method"
```

---

## Task 4: Watermark helper (sharp)

**Files:**
- Create: `lib/services/watermark.ts`

- [ ] **Step 1: Create `lib/services/watermark.ts`**

```ts
import sharp from "sharp";

/**
 * Overlay "pngtubermaker.com" in the bottom-right corner of an image.
 * Uses an SVG overlay so text rendering is consistent across platforms.
 * Font size scales with image width (~2%), white @ 70% opacity with a subtle shadow.
 */
export async function watermarkImage(input: Buffer): Promise<Buffer> {
  const img = sharp(input);
  const meta = await img.metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  const fontSize = Math.max(14, Math.round(width * 0.02));
  const padX = Math.round(width * 0.02);
  const padY = Math.round(height * 0.02);
  const text = "pngtubermaker.com";

  const svg = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm {
          font: 500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          fill: #ffffff;
          fill-opacity: 0.7;
          paint-order: stroke;
          stroke: #000000;
          stroke-opacity: 0.25;
          stroke-width: ${Math.max(1, Math.round(fontSize / 12))}px;
        }
      </style>
      <text x="${width - padX}" y="${height - padY}" text-anchor="end" class="wm">${text}</text>
    </svg>`,
  );

  return img
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toBuffer();
}
```

- [ ] **Step 2: Verify**

```bash
bun run check
```

- [ ] **Step 3: Commit**

```bash
git add lib/services/watermark.ts
git commit -m "feat(storage): add sharp-based watermark helper"
```

---

## Task 5: API route `POST /api/avatars/[id]/reference-sheet`

**Files:**
- Create: `app/api/avatars/[id]/reference-sheet/route.ts`
- Modify: `lib/middleware/rate-limit.ts` (add limiter)

- [ ] **Step 1: Add rate limiter**

In `lib/middleware/rate-limit.ts`, after the existing `expressionPackLimiter` export (~line 103), add:

```ts
export const referenceSheetLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 per minute per user
});
```

- [ ] **Step 2: Create the route**

`app/api/avatars/[id]/reference-sheet/route.ts`:

```ts
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { avatars } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import {
  createRateLimitHeaders,
  getRateLimitIdentifier,
  referenceSheetLimiter,
} from "@/lib/middleware/rate-limit";
import {
  consumeWithRecord,
  refundWithUpdate,
  TASK_COSTS,
} from "@/lib/services/credits-transaction";
import { GptImageAdapter } from "@/lib/services/generation/gpt-image-adapter";
import { REFERENCE_SHEET_PROMPT } from "@/lib/services/generation/reference-sheet-prompt";
import { uploadImageToR2 } from "@/lib/services/storage";
import { watermarkImage } from "@/lib/services/watermark";

/**
 * POST /api/avatars/[id]/reference-sheet
 *
 * Generate (or regenerate) a character reference sheet for a completed avatar.
 * Overwrites any existing reference sheet; no refund for overwrites.
 *
 * Auth: Required (must own avatar)
 * Cost: 200 credits (TASK_COSTS.reference_sheet)
 * Rate Limit: 5 requests per minute per user
 * Response: { avatarId, referenceSheetUrl, referenceSheetR2Key, referenceSheetGeneratedAt }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = getRateLimitIdentifier(req, session.user.id);
    const rl = referenceSheetLimiter.check(identifier);
    if (!rl.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Retry in ${Math.ceil(
            (rl.reset * 1000 - Date.now()) / 1000,
          )}s.`,
          reset: rl.reset,
        },
        { status: 429, headers: createRateLimitHeaders(rl) },
      );
    }

    const { id: avatarId } = await params;

    const db = getDatabase();
    const rows = await db
      .select()
      .from(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, session.user.id)))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    const a = rows[0];
    if (a.status !== "completed" || !a.baseImageUrl) {
      return NextResponse.json(
        { error: "Avatar not ready" },
        { status: 400 },
      );
    }

    const sourceImageUrl = a.originalBaseImageUrl ?? a.baseImageUrl;
    const cost = TASK_COSTS.reference_sheet;

    // Atomic credit consumption (no DB write yet — we only mutate avatars row after success)
    const consumeResult = await consumeWithRecord(
      session.user.id,
      cost,
      `Reference sheet generation for avatar ${avatarId}`,
      async (_tx, _transactionId) => {
        return { ok: true };
      },
      { avatarId, taskType: "reference_sheet" },
    );

    if (!consumeResult.success) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          balance: consumeResult.newBalance,
          required: cost,
        },
        { status: 402 },
      );
    }

    // Generate via GPT-Image-2 edit (1024×1024)
    const adapter = new GptImageAdapter();
    let generatedUrl: string | null = null;
    try {
      generatedUrl = await adapter.editWithPrompt(
        sourceImageUrl,
        REFERENCE_SHEET_PROMPT,
      );
    } catch (err) {
      console.error("[ReferenceSheet] adapter threw:", err);
    }

    if (!generatedUrl) {
      await refundWithUpdate(
        session.user.id,
        cost,
        `Reference sheet generation failed for avatar ${avatarId}`,
        async () => ({ refunded: true }),
        { avatarId, taskType: "reference_sheet" },
      );
      return NextResponse.json(
        { error: "generation_failed" },
        { status: 502 },
      );
    }

    // Download, watermark, upload to R2
    let finalUrl: string;
    let r2Key: string;
    try {
      const imgRes = await fetch(generatedUrl);
      if (!imgRes.ok) {
        throw new Error(`fetch ${generatedUrl} -> HTTP ${imgRes.status}`);
      }
      const inputBuf = Buffer.from(await imgRes.arrayBuffer());
      const watermarked = await watermarkImage(inputBuf);

      const timestamp = Date.now();
      r2Key = `avatars/${session.user.id}/${avatarId}/reference-sheet/${timestamp}.png`;
      finalUrl = await uploadImageToR2(watermarked, r2Key, "image/png");
    } catch (err) {
      console.error("[ReferenceSheet] post-processing failed:", err);
      await refundWithUpdate(
        session.user.id,
        cost,
        `Reference sheet upload failed for avatar ${avatarId}`,
        async () => ({ refunded: true }),
        { avatarId, taskType: "reference_sheet" },
      );
      return NextResponse.json(
        { error: "upload_failed" },
        { status: 500 },
      );
    }

    const now = new Date();
    await db
      .update(avatars)
      .set({
        referenceSheetUrl: finalUrl,
        referenceSheetR2Key: r2Key,
        referenceSheetGeneratedAt: now,
        updatedAt: now,
      })
      .where(eq(avatars.id, avatarId));

    return NextResponse.json({
      avatarId,
      referenceSheetUrl: finalUrl,
      referenceSheetR2Key: r2Key,
      referenceSheetGeneratedAt: now.toISOString(),
    });
  } catch (error) {
    console.error(
      "[API] Unhandled error in POST /api/avatars/[id]/reference-sheet:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Verify**

```bash
bun run check
```

- [ ] **Step 4: Smoke-test against a local dev server (manual)**

Start `bun run dev`, log in, pick a completed avatar id `X` from the dashboard, and run:

```bash
curl -X POST http://localhost:3000/api/avatars/X/reference-sheet \
  -H "Cookie: <copy from browser devtools>"
```

Expected: `200 OK` with `referenceSheetUrl` pointing at R2 CDN. Open the URL — should see a 1024×1024 reference sheet with `pngtubermaker.com` watermark bottom-right. Wallet balance decreased by 200.

- [ ] **Step 5: Commit**

```bash
git add app/api/avatars/\[id\]/reference-sheet lib/middleware/rate-limit.ts
git commit -m "feat(api): POST /api/avatars/[id]/reference-sheet with watermark + refund"
```

---

## Task 6: Generic `ImageActionIcons` — add hover Download to candidate cards

The goal is a reusable corner-toolbar component: by default it renders a hover-visible `Download` button; later callers can compose other actions.

**Files:**
- Create: `components/ui/ImageActionIcons.tsx`
- Modify: `components/create/CandidateCard.tsx`
- Modify: `components/create/GenerationGroup.tsx` — **remove** `handleDownload` & `Download` button; we'll replace with Character Sheet button in Task 8

- [ ] **Step 1: Create `components/ui/ImageActionIcons.tsx`**

```tsx
"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface ImageActionIconsProps {
  /** Image URL to download when the user clicks the download icon. */
  imageUrl: string;
  /** Suggested filename (no extension). Defaults to a timestamped name. */
  filename?: string;
  /** Visible always (true) or only on hover (false, default). */
  alwaysVisible?: boolean;
}

export function ImageActionIcons({
  imageUrl,
  filename,
  alwaysVisible = false,
}: ImageActionIconsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || `image-${Date.now()}`}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[ImageActionIcons] download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`absolute top-2 right-2 z-10 flex gap-1.5 transition-all duration-200 ${
        alwaysVisible
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md hover:bg-white hover:scale-105 transition-all disabled:opacity-60"
        title="Download image"
      >
        <Download className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Integrate into `CandidateCard.tsx`**

Add the import near the top:

```tsx
import { ImageActionIcons } from "@/components/ui/ImageActionIcons";
```

Inside the returned JSX of `CandidateCard`, after the closing `</button>` of the main image button but still inside the outer `<div className="relative group">`, add:

```tsx
      {!disabled && (
        <ImageActionIcons
          imageUrl={imageUrl}
          filename={`candidate-${index + 1}`}
        />
      )}
```

Note: the existing selected checkmark (`:67-71`) is rendered **inside** the `<button>` with `absolute top-3 right-3`. The new `ImageActionIcons` renders at `top-2 right-2` in the outer div. When selected, both are visible — that's fine (the checkmark is on top of the image, the download icon is outside the button). If visually clashing in test, set `alwaysVisible={false}` (default) and rely on `group-hover` — the group is the outer div so hover still works when selected.

- [ ] **Step 3: Remove stale Download button from `GenerationGroup.tsx`**

In `components/create/GenerationGroup.tsx:454-462`, delete the entire `<button ...>Download</button>` block (including its preceding newline/whitespace). Also delete:
- `Download` from the `lucide-react` import (`:6`) — **keep it** for now if still referenced elsewhere in the file; re-verify via `grep -n Download components/create/GenerationGroup.tsx`. If no remaining usage, remove.
- `isDownloading` state and `handleDownload` function (`:68`, `:188-195`) — **keep** because the `onDownload` prop is still received; we'll re-purpose in Task 8. Actually, since Task 8 removes the download entirely, delete these now.
- Remove `onDownload` from the props destructure (`:61`) and from the interface (`:38`).

Then in the parent that passes `onDownload` — check `components/create/AvatarGenerator.tsx` — remove the prop it passes in. Run `bun run check` and fix whatever TS complains about.

- [ ] **Step 4: Verify**

```bash
bun run check
bun run dev    # manual: candidate card shows hover Download icon; /create still compiles
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/ImageActionIcons.tsx components/create/CandidateCard.tsx components/create/GenerationGroup.tsx components/create/AvatarGenerator.tsx
git commit -m "feat(create): hover Download icon on candidate cards; remove stale Download button"
```

---

## Task 7: Generic `ShareButtons`

**Files:**
- Create: `components/ui/ShareButtons.tsx`

- [ ] **Step 1: Create `components/ui/ShareButtons.tsx`**

```tsx
"use client";

import { Check, Copy, Twitter } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  /** Public URL of the image/artifact to share. */
  url: string;
  /** Tweet text (the URL will be appended by Twitter's intent). */
  tweetText?: string;
  /** Text to copy for Discord/generic paste. URL is appended if not already present. */
  copyText?: string;
}

export function ShareButtons({
  url,
  tweetText = "Made my PNGTuber character with pngtubermaker.com",
  copyText,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    const text = copyText
      ? copyText.includes(url)
        ? copyText
        : `${copyText} ${url}`
      : `${tweetText} ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[ShareButtons] copy failed:", err);
    }
  };

  return (
    <div className="flex gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#1DA1F2] rounded-xl hover:bg-[#1a91da] transition-colors"
      >
        <Twitter className="w-4 h-4" />
        Share on Twitter
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        title="Copy link for Discord"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy for Discord
          </>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
bun run check
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/ShareButtons.tsx
git commit -m "feat(ui): generic ShareButtons (Twitter intent + copy-for-Discord)"
```

---

## Task 8: `/create` page — Generate Character Sheet button + result card

**Files:**
- Create: `components/create/ReferenceSheetResultCard.tsx`
- Modify: `components/create/GenerationGroup.tsx` (replace removed Download slot with `Generate Character Sheet` button; wire insufficient-credits handling)
- Modify: `components/create/AvatarGenerator.tsx` (state for per-avatar reference sheet; push `ReferenceSheetResultCard` into the results feed)
- Modify: `hooks/use-avatar-generator.ts` — add minimal reference-sheet state (if state management is centralized there)

**Architecture note:** Rather than piping through `use-avatar-generator`, keep the reference-sheet state **local** to `AvatarGenerator.tsx` (a `Map<avatarId, ReferenceSheetState>`) so we don't bloat the core hook. The result card is rendered in the same feed column where `ExpressionResultsCard` lives today.

- [ ] **Step 1: Create `ReferenceSheetResultCard.tsx`**

```tsx
"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { ImageActionIcons } from "@/components/ui/ImageActionIcons";
import { ShareButtons } from "@/components/ui/ShareButtons";

export type ReferenceSheetCardState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "failed"; error: string }
  | { status: "completed"; url: string; generatedAt: string };

interface ReferenceSheetResultCardProps {
  avatarId: string;
  avatarSlug?: string | null;
  state: ReferenceSheetCardState;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function ReferenceSheetResultCard({
  avatarId,
  avatarSlug,
  state,
  onGenerate,
  onRegenerate,
}: ReferenceSheetResultCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-[4] min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
            Character Reference Sheet
          </span>

          {state.status === "idle" && (
            <div className="aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                Not generated yet
              </p>
            </div>
          )}

          {state.status === "generating" && (
            <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            </div>
          )}

          {state.status === "failed" && (
            <div className="rounded-xl bg-red-50 border border-red-200/60 p-4 text-sm text-red-600">
              {state.error}
            </div>
          )}

          {state.status === "completed" && (
            <div className="relative group rounded-xl overflow-hidden border border-gray-200">
              {/* biome-ignore lint/performance/noImgElement: external R2 URLs */}
              <img
                src={state.url}
                alt="Character reference sheet"
                className="w-full aspect-square object-contain bg-white"
              />
              <ImageActionIcons
                imageUrl={state.url}
                filename={`reference-sheet-${avatarId}`}
              />
            </div>
          )}
        </div>

        <div className="flex-[1] min-w-[220px] bg-gray-50/70 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
          <div className="flex-1 min-h-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">
              Reference Sheet
            </span>
            <p className="text-sm text-gray-600">
              {state.status === "completed"
                ? "Three views, expressions, palette & world setting — all in one sheet."
                : state.status === "generating"
                  ? "Generating… takes about 30s."
                  : state.status === "failed"
                    ? "Something went wrong. Credits were refunded."
                    : "Turn this character into an official-style reference sheet."}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            {state.status === "idle" && (
              <button
                type="button"
                onClick={onGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Generate Character Sheet
                <span className="text-white/70 text-xs">(200)</span>
              </button>
            )}
            {state.status === "generating" && (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl opacity-70"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </button>
            )}
            {state.status === "failed" && (
              <button
                type="button"
                onClick={onGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
              >
                <Sparkles className="w-4 h-4" />
                Try Again
              </button>
            )}
            {state.status === "completed" && (
              <>
                <Link
                  href={`/avatars/${avatarSlug || avatarId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200"
                >
                  View Avatar
                </Link>
                <ShareButtons
                  url={state.url}
                  tweetText="Made my PNGTuber character with pngtubermaker.com 🎨"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "Regenerate will overwrite the current reference sheet and cost 200 credits. Continue?",
                      )
                    ) {
                      onRegenerate();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate (200)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire `GenerationGroup` button**

In `components/create/GenerationGroup.tsx`, around where `Generate Expressions` button was (lines `:411-451`), after that button block (but still inside the `isThisGroupSelected && selected && generation.type === "avatar" && generation.status === "completed"` branch), add a second CTA:

```tsx
                  <button
                    type="button"
                    onClick={onGenerateReferenceSheet}
                    disabled={isReferenceSheetGenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-cyan-400 rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)] transition-all duration-200 disabled:opacity-50"
                  >
                    {isReferenceSheetGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating sheet...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Character Sheet
                        <span className="text-white/70 text-xs">(200)</span>
                      </>
                    )}
                  </button>
```

Add two new props on `GenerationGroupProps` (after `onRegenerate`):

```ts
  onGenerateReferenceSheet: () => void;
  isReferenceSheetGenerating: boolean;
```

Destructure them in the component signature. The old `onDownload` prop was already removed in Task 6.

- [ ] **Step 3: Wire state + push result card in `AvatarGenerator.tsx`**

In `components/create/AvatarGenerator.tsx`, add at the top of the component:

```tsx
import { useState } from "react";
import { ReferenceSheetResultCard, type ReferenceSheetCardState } from "./ReferenceSheetResultCard";
import { useBuyCreditsModal } from "@/hooks/use-buy-credits-modal";
import { TASK_COSTS } from "@/lib/services/credits";
```

(Skip imports already present.)

Inside the component body:

```tsx
const [refSheets, setRefSheets] = useState<Record<string, ReferenceSheetCardState>>({});

const generateReferenceSheet = async (avatarId: string) => {
  setRefSheets((prev) => ({ ...prev, [avatarId]: { status: "generating" } }));
  try {
    const res = await fetch(`/api/avatars/${avatarId}/reference-sheet`, {
      method: "POST",
    });
    if (res.status === 402) {
      useBuyCreditsModal.getState().open(TASK_COSTS.reference_sheet);
      setRefSheets((prev) => {
        const next = { ...prev };
        delete next[avatarId];
        return next;
      });
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setRefSheets((prev) => ({
        ...prev,
        [avatarId]: {
          status: "failed",
          error:
            data.error === "generation_failed"
              ? "Generation failed — credits refunded."
              : data.error === "upload_failed"
                ? "Upload failed — credits refunded."
                : "Something went wrong.",
        },
      }));
      return;
    }
    const data = await res.json();
    setRefSheets((prev) => ({
      ...prev,
      [avatarId]: {
        status: "completed",
        url: data.referenceSheetUrl,
        generatedAt: data.referenceSheetGeneratedAt,
      },
    }));
  } catch (err) {
    console.error("[AvatarGenerator] reference sheet failed:", err);
    setRefSheets((prev) => ({
      ...prev,
      [avatarId]: { status: "failed", error: "Network error." },
    }));
  }
};
```

In the JSX feed, after each `<ExpressionResultsCard ...>` render, emit:

```tsx
{avatarId && refSheets[avatarId] && refSheets[avatarId].status !== "idle" && (
  <ReferenceSheetResultCard
    avatarId={avatarId}
    avatarSlug={/* existing avatar slug if available */ null}
    state={refSheets[avatarId]}
    onGenerate={() => generateReferenceSheet(avatarId)}
    onRegenerate={() => generateReferenceSheet(avatarId)}
  />
)}
```

Pass the handler + state to `GenerationGroup`:

```tsx
<GenerationGroup
  // ...existing props (minus onDownload)
  onGenerateReferenceSheet={() => generateReferenceSheet(generation.avatarId!)}
  isReferenceSheetGenerating={
    !!generation.avatarId &&
    refSheets[generation.avatarId]?.status === "generating"
  }
/>
```

**When the `Generate Character Sheet` button in `GenerationGroup` is clicked**, the handler sets state to `generating`, which also makes `ReferenceSheetResultCard` appear in the feed below (first time). Subsequent clicks from the result card's own buttons go through the same path.

- [ ] **Step 4: Verify**

```bash
bun run check
bun run dev
# Manual smoke test:
# 1. Log in, generate 4 candidate avatars on /create
# 2. Select one → see three buttons: [Generate Expressions] [Generate Character Sheet (200)] [Regenerate]
# 3. Click Generate Character Sheet
# 4. ReferenceSheetResultCard appears below, shows shimmer, then rendered sheet with watermark
# 5. Click Share on Twitter → opens intent; Copy for Discord → clipboard populated; Download icon on hover downloads PNG
# 6. Click Regenerate → confirm dialog → runs again
# 7. With 0 balance → BuyCreditsModal opens
```

- [ ] **Step 5: Commit**

```bash
git add components/create/ReferenceSheetResultCard.tsx components/create/GenerationGroup.tsx components/create/AvatarGenerator.tsx
git commit -m "feat(create): Generate Character Sheet CTA + result card in /create flow"
```

---

## Task 9: Avatar detail page — conditional button + `ReferenceSheetCard` under Live Preview

**Files:**
- Create: `components/avatars/ReferenceSheetCard.tsx`
- Modify: `components/avatars/AvatarDetailClient.tsx`

The "state → position" rule:
- **Not generated** → a 4th button in the pack button row (`:852-891`): `Generate Character Sheet (200)`
- **Generated** → button disappears from pack row; `ReferenceSheetCard` renders in the Live Preview section (below the preview, same section — not a new major section)

- [ ] **Step 1: Create `components/avatars/ReferenceSheetCard.tsx`**

```tsx
"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { ImageActionIcons } from "@/components/ui/ImageActionIcons";
import { ShareButtons } from "@/components/ui/ShareButtons";

interface ReferenceSheetCardProps {
  avatarId: string;
  initialUrl: string;
  onRegenerated: (newUrl: string, generatedAt: string) => void;
}

export function ReferenceSheetCard({
  avatarId,
  initialUrl,
  onRegenerated,
}: ReferenceSheetCardProps) {
  const [url, setUrl] = useState(initialUrl);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Regenerate will overwrite the current reference sheet and cost 200 credits. Continue?",
      )
    ) {
      return;
    }
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/avatars/${avatarId}/reference-sheet`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "insufficient_credits"
            ? "Not enough credits."
            : data.error === "generation_failed"
              ? "Generation failed — credits refunded."
              : "Something went wrong.",
        );
        return;
      }
      const data = await res.json();
      setUrl(data.referenceSheetUrl);
      onRegenerated(data.referenceSheetUrl, data.referenceSheetGeneratedAt);
    } catch (err) {
      console.error("[ReferenceSheetCard] regenerate failed:", err);
      setError("Network error.");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Character Reference Sheet
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-[3] min-w-0">
          <div className="relative group rounded-xl overflow-hidden border border-gray-200">
            {/* biome-ignore lint/performance/noImgElement: external R2 URLs */}
            <img
              src={url}
              alt="Character reference sheet"
              className="w-full aspect-square object-contain bg-white"
            />
            <ImageActionIcons
              imageUrl={url}
              filename={`reference-sheet-${avatarId}`}
            />
            {regenerating && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-[1] min-w-[220px] bg-gray-50/70 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Three views, expressions, palette & world setting — all in one
            sheet.
          </p>
          <ShareButtons
            url={url}
            tweetText="Made my PNGTuber character with pngtubermaker.com 🎨"
          />
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate (200)
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire the detail page**

In `components/avatars/AvatarDetailClient.tsx`:

1. Add imports near the top:
   ```tsx
   import { ReferenceSheetCard } from "./ReferenceSheetCard";
   import { Sparkles, Loader2 } from "lucide-react"; // merge with existing
   ```
2. Add component state at the top of the render body (next to other `useState` calls):
   ```tsx
   const [referenceSheetUrl, setReferenceSheetUrl] = useState<string | null>(
     avatar.referenceSheetUrl ?? null,
   );
   const [generatingSheet, setGeneratingSheet] = useState(false);
   const [sheetError, setSheetError] = useState<string | null>(null);

   const handleGenerateReferenceSheet = async () => {
     setGeneratingSheet(true);
     setSheetError(null);
     try {
       const res = await fetch(`/api/avatars/${avatar.id}/reference-sheet`, {
         method: "POST",
       });
       if (res.status === 402) {
         useBuyCreditsModal.getState().open(200);
         return;
       }
       if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         setSheetError(
           data.error === "generation_failed"
             ? "Generation failed — credits refunded."
             : "Something went wrong.",
         );
         return;
       }
       const data = await res.json();
       setReferenceSheetUrl(data.referenceSheetUrl);
     } catch (err) {
       console.error("[AvatarDetail] reference sheet failed:", err);
       setSheetError("Network error.");
     } finally {
       setGeneratingSheet(false);
     }
   };
   ```
   (If `useBuyCreditsModal` isn't imported, add it: `import { useBuyCreditsModal } from "@/hooks/use-buy-credits-modal";`.)

3. In the Live Preview section (search for `PNGTuberPreview` usage — it's wrapped in conditional render), **immediately after the Live Preview JSX block closes**, insert:
   ```tsx
   {referenceSheetUrl && (
     <ReferenceSheetCard
       avatarId={avatar.id}
       initialUrl={referenceSheetUrl}
       onRegenerated={(url) => setReferenceSheetUrl(url)}
     />
   )}
   ```

4. In the pack buttons row (`:852-891`), after the `.map(...)` closing, but still inside the `<div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200/60">`, add the 4th button **only when `!referenceSheetUrl`**:
   ```tsx
   {!referenceSheetUrl && (
     <button
       type="button"
       onClick={handleGenerateReferenceSheet}
       disabled={generatingSheet}
       className={cn(
         "btn gap-2 px-6 py-2.5 h-auto text-base font-medium shadow-sm",
         generatingSheet
           ? "btn-primary"
           : "btn-primary hover:shadow-md hover:scale-105 transition-all",
       )}
     >
       {generatingSheet ? (
         <>
           <span className="loading loading-spinner loading-sm" />
           <span>Generating Sheet...</span>
         </>
       ) : (
         <>
           <Sparkles className="w-5 h-5" />
           <span>Generate Character Sheet</span>
           <span className="text-white/70 text-xs">(200)</span>
         </>
       )}
     </button>
   )}
   ```
   If `sheetError` is truthy, render a small `<p className="text-xs text-red-600 mt-2">{sheetError}</p>` at the bottom of the pack-buttons row.

5. **Types:** the server component that loads `avatar` (`app/[locale]/(main)/avatars/[id]/page.tsx` or wherever) must pass the 3 new columns through. Drizzle infers them from schema automatically, so if `avatar` is typed `typeof avatars.$inferSelect`, no change needed. If a custom DTO type is used, add `referenceSheetUrl: string | null` etc. Run `bun run check` and follow the TS errors.

- [ ] **Step 3: Verify**

```bash
bun run check
bun run dev
# Manual test:
# 1. Open a completed avatar with NO reference sheet
#    → expression pack row shows 3 existing + new "Generate Character Sheet" button
# 2. Click → spinner in button; Live Preview still visible
# 3. On success → button disappears; ReferenceSheetCard appears under Live Preview
# 4. Share buttons work; Download hover icon works; Regenerate confirms & reruns
```

- [ ] **Step 4: Commit**

```bash
git add components/avatars/ReferenceSheetCard.tsx components/avatars/AvatarDetailClient.tsx
git commit -m "feat(detail): conditional ReferenceSheetCard under Live Preview; 4th pack-row button"
```

---

## Task 10: Final end-to-end verification

- [ ] **Step 1: Full lint + build**

```bash
bun run check
bun run build
```

Both must pass.

- [ ] **Step 2: Manual regression**

Smoke-test the following user journeys with `bun run dev`:

1. **`/create` happy path:** generate avatar → select candidate → click `Generate Character Sheet` → see the result card appear in the feed → share/download/regenerate all work.
2. **`/create` candidate download:** hover any of the 4 candidate images → new Download icon appears top-right → click downloads the PNG.
3. **Detail page (never generated):** open `/avatars/[id]` → 4th pack button visible → click → spinner → success → button gone, card appears under Live Preview.
4. **Detail page (already generated):** open `/avatars/[id]` for an avatar with `referenceSheetUrl` set → no 4th button → card present from first paint.
5. **Insufficient credits:** drain wallet below 200 → click Generate → BuyCreditsModal opens, no state change.
6. **Backend failure (simulate):** temporarily throw in `adapter.editWithPrompt` → verify refund transaction is recorded and UI shows `Try Again`.
7. **Regenerate:** confirm dialog appears, second call succeeds, old URL replaced in DB and UI.

- [ ] **Step 3: No loose ends**

```bash
grep -rn "onDownload" components/create/
```

Verify there are no dangling references to the removed `onDownload` prop chain.

- [ ] **Step 4: Final commit (if anything residual)**

```bash
git status
# If clean, skip. Otherwise:
# git add -u && git commit -m "chore(reference-sheet): final fixups"
```

---

## Out of scope (intentionally deferred)

- Dashboard `AvatarCard` entry — **not doing** (per decision).
- `/create` `upsell` / auto-trigger on expression-pack completion — **not doing**.
- First-time free — **not doing**.
- Landscape / 3:4 / PDF export — **not doing**.
- Separate `reference_sheets` table — **not doing**; coverage via 3 columns is sufficient until multi-version support is required.

---

## Notes for the executor (MiniMax)

- Sharp is at `package.json:61` v0.34.5 — already installed, do not re-add.
- Do not touch unrelated files. If a TS compile error forces an unrelated edit, keep it minimal.
- Do **not** write tests — this project has no test runner; `bun run check` (Biome) is the sole quality gate.
- Commit after each task finishes cleanly. Use conventional-commit messages shown in each step.
- If `bun run db:push` warns about data loss on an existing column, stop and surface the warning — do not force push.
- If `bun run check` auto-fixes formatting, stage those changes with each task's commit.
