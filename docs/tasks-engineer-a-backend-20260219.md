# Engineer A — Backend Tasks

> Assignee: Backend Engineer
> Dependencies: Wait for skeleton commit from lead (Tasks 1.1, 1.2, 1.4, 2.1, 2.3)
> Reference docs: [dev-plan](./dev-plan-20260219.md), [pricing-model](./pricing-model-20260219.md), [technical-architecture](./technical-architecture-20260219.md)

---

## Before You Start

1. Pull latest from `main` — the lead will have committed:
   - Updated DB schema (`database/schema.ts`)
   - Credit service (`lib/services/credits.ts`)
   - Stripe webhook update (`app/api/webhooks/stripe/route.ts`)
   - Generation adapter pattern (`lib/services/generation/`)
   - Avatar generation API (`app/api/avatars/generate/route.ts`) — **use this as your reference for all APIs**
2. Run `bun install && bun run db:push` to sync DB
3. Run `bun run dev` and verify mock generation works at `/create`

---

## Your Tasks

### Task 1.3: Credit API Endpoints

**Priority**: P0
**Reference**: `lib/services/credits.ts` (already implemented)

Create two API routes that wrap the existing credit service functions.

**File**: `app/api/credits/balance/route.ts`

```typescript
// GET /api/credits/balance
// Auth: Required
// Response: { total: number, subscription: number, purchased: number, expiresAt: string | null }

// Implementation:
// 1. Get session via auth.api.getSession({ headers: req.headers })
// 2. If no session → return 401
// 3. Call getBalance(session.user.id) from lib/services/credits.ts
// 4. Return JSON response
```

**File**: `app/api/credits/history/route.ts`

```typescript
// GET /api/credits/history?page=1&limit=20
// Auth: Required
// Response: { transactions: CreditTransaction[], hasMore: boolean }

// Implementation:
// 1. Auth check (same pattern)
// 2. Parse query params: page (default 1), limit (default 20, max 100)
// 3. Query credit_transactions table WHERE userId = session.user.id
//    ORDER BY createdAt DESC
//    LIMIT limit+1 OFFSET (page-1)*limit
// 4. hasMore = results.length > limit, then slice to limit
// 5. Return JSON
```

**Acceptance criteria**:
- [ ] 401 for unauthenticated requests
- [ ] Pagination works correctly
- [ ] Response types match what frontend expects
- [ ] `bun run check` passes

---

### Task 1.5: Welcome Credits on Signup

**Priority**: P0
**Reference**: `lib/auth.ts`, `lib/services/credits.ts`

Grant 500 credits to new users on first signup.

**File changes**: `lib/auth.ts`

```typescript
// Add to betterAuth config:
// hooks or events → onUserCreated callback

// When a new user is created:
// 1. Create wallet record for user
// 2. Call grantPurchasedCredits(userId, 500) — welcome credits
//    Note: Use purchased credits (not subscription) so they don't expire monthly.
//    But set a 30-day expiry via a separate mechanism:
//    - Add expiresAt to the credit_transactions record
//    - Or simply use grantSubscriptionCredits with 30-day expiry
//
// Check with lead which function to use. The key is: 500 credits, expire in 30 days.

// Environment variables used:
// WELCOME_CREDITS=500 (from process.env, default 500)
// WELCOME_CREDITS_EXPIRY_DAYS=30 (from process.env, default 30)
```

**Acceptance criteria**:
- [ ] New OAuth signup gets 500 credits
- [ ] Credits appear in GET /api/credits/balance
- [ ] Existing users NOT affected (idempotent)
- [ ] Credit transaction logged with description "Welcome bonus"

---

### Task 2.4: Expression Generation API

**Priority**: P1
**Reference**: `app/api/avatars/generate/route.ts` (follow this pattern exactly)

**File**: `app/api/avatars/[id]/expressions/route.ts`

```typescript
// POST /api/avatars/[id]/expressions
// Auth: Required (must own this avatar)
// Body: { expressions: ['talking', 'happy', 'sad'] }
// Cost: 200 credits × expressions.length

// Flow:
// 1. Auth check
// 2. Fetch avatar by id, verify userId === session.user.id
// 3. Verify avatar status === 'completed' (has a base image)
// 4. Validate expressions array:
//    - Allowed values: 'talking', 'happy', 'sad', 'angry', 'surprised'
//    - No duplicates
//    - Max 6 at once
// 5. Calculate cost: 200 × expressions.length
// 6. consumeCredits(userId, cost, `Expression pack: ${expressions.join(', ')}`)
//    - If insufficient → return 402 { error: 'insufficient_credits', balance, required }
// 7. Create avatar_expressions records (status: 'pending')
// 8. For each expression (sequentially):
//    a. Update record status → 'generating'
//    b. Call adapter.generateExpression(avatar.baseImageUrl, expressionType)
//    c. If success → upload to R2 → update record (status: 'completed', imageUrl)
//    d. If fail → update record (status: 'failed')
// 9. If any expressions failed:
//    - Refund: 200 × failedCount credits
//    - Log refund transaction
// 10. Return { avatarId, expressions: [{ id, type, status, imageUrl }] }

// IMPORTANT: Process expressions sequentially (not parallel)
// because Nano Banana needs the same base image reference
// and parallel requests may hit rate limits.
```

**Acceptance criteria**:
- [ ] Credits consumed before generation starts
- [ ] Failed expressions get refunded proportionally
- [ ] Avatar ownership validated
- [ ] Expression records created in DB
- [ ] Works with mock adapter (returns placeholder images)
- [ ] Invalid expression types rejected with 400

---

### Task 2.5: Expression Regeneration API

**Priority**: P1
**Reference**: Task 2.4 (subset of that logic)

**File**: `app/api/avatars/[id]/expressions/[expressionId]/regenerate/route.ts`

```typescript
// POST /api/avatars/[id]/expressions/[expressionId]/regenerate
// Auth: Required (must own avatar)
// Cost: 200 credits

// Flow:
// 1. Auth check + ownership check
// 2. Fetch expression record, verify it belongs to this avatar
// 3. consumeCredits(userId, 200, `Regenerate ${expression.type}`)
// 4. Call adapter.generateExpression(avatar.baseImageUrl, expression.type)
// 5. If success:
//    a. Delete old image from R2 (if exists)
//    b. Upload new image to R2
//    c. Update expression record with new imageUrl
// 6. If fail:
//    a. Refund 200 credits
//    b. Keep old image (don't delete)
// 7. Return { expressionId, type, status, imageUrl }
```

**Acceptance criteria**:
- [ ] Old image deleted from R2 only on success
- [ ] Credits refunded on failure
- [ ] Returns updated expression data

---

### Task 2.6: Avatar Selection API

**Priority**: P1

**File**: `app/api/avatars/[id]/select/route.ts`

```typescript
// POST /api/avatars/[id]/select
// Auth: Required (must own avatar)
// Body: { selectedIndex: number }  // 0-3
// Cost: 0 credits (free)

// Flow:
// 1. Auth + ownership check
// 2. Validate selectedIndex is 0-3
// 3. Avatar must have status 'generating' or have candidateImages
// 4. Set avatar.baseImageUrl = candidateImages[selectedIndex]
// 5. Set avatar.status = 'completed'
// 6. Delete other 3 images from R2
// 7. Generate thumbnail (resize to 256x256) for list view
// 8. Return { avatarId, baseImageUrl, thumbnailUrl }
```

**Acceptance criteria**:
- [ ] Only 1 of 4 images kept
- [ ] Unselected images deleted from R2
- [ ] Avatar status updated to 'completed'
- [ ] Thumbnail generated and saved

---

### Task 2.7: Image Upload & Processing Pipeline

**Priority**: P1
**Reference**: Copy from `thumb-free/app/api/images/upload-proxy/route.ts`

**File**: `app/api/images/upload/route.ts`

```typescript
// Copy the upload proxy from thumb-free project, then adapt:

// Changes from original:
// 1. Output format: PNG (not WebP) — we need transparency support
//    - sharp(buffer).png({ quality: 90 }) instead of .webp()
// 2. Keep transparency (alpha channel)
//    - Do NOT flatten to white background
// 3. R2 key structure: avatars/{userId}/{avatarId}/{filename}.png
// 4. Max dimensions: 2160x2160 (4K max)
// 5. Max file size: 10MB

// Also create a server-side utility for internal uploads:
// lib/services/storage.ts
//
// uploadImageToR2(buffer: Buffer, key: string): Promise<string>  // returns public URL
// deleteFromR2(key: string): Promise<void>
// generateAvatarKey(userId, avatarId, filename): string
```

**Acceptance criteria**:
- [ ] PNG output with transparency preserved
- [ ] R2 upload works (test with existing R2 credentials)
- [ ] Public URL returned correctly
- [ ] File size validation works

---

### Task 2.8: Download API

**Priority**: P1
**Dependencies**: Task 2.7 (storage utilities)

**File**: `app/api/avatars/[id]/download/route.ts`

```typescript
// GET /api/avatars/[id]/download?format=zip&size=1080
// Auth: Required (must own avatar)

// Flow:
// 1. Auth + ownership check
// 2. Fetch avatar + all expressions
// 3. Size gating by tier:
//    - Free: max 512
//    - Start: max 1080
//    - Pro: max 2160
//    - If requested size > tier max → return 403 with upgrade message
// 4. For each image (base + expressions):
//    a. Fetch from R2
//    b. Resize to requested size (sharp.resize)
//    c. Apply watermark if Free tier (see Task 4.1, skip for now, just add TODO)
// 5. If format === 'zip':
//    a. Use 'archiver' package (bun add archiver @types/archiver)
//    b. Add all PNGs to zip: {name}_{expression}.png
//    c. Stream zip response with Content-Disposition header
// 6. If format === 'individual':
//    a. Return JSON with download URLs (presigned or public)

// File naming in ZIP:
// {avatarName}_idle.png
// {avatarName}_talking.png
// {avatarName}_happy.png
// {avatarName}_sad.png

// Headers for ZIP download:
// Content-Type: application/zip
// Content-Disposition: attachment; filename="{avatarName}_pngtuber.zip"
```

**Acceptance criteria**:
- [ ] ZIP downloads with correct file names
- [ ] Size gating works by subscription tier
- [ ] Images resized correctly (maintain aspect ratio)
- [ ] Watermark TODO placeholder for Free tier
- [ ] `bun run check` passes

---

## Coding Patterns to Follow

### Auth Check Pattern (from reference API)

```typescript
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  // ...
}
```

### Credit Consumption Pattern

```typescript
import { consumeCredits, refundCredits } from "@/lib/services/credits";

// Before generation:
const result = await consumeCredits(userId, 300, "Avatar generation");
if (!result.success) {
  return NextResponse.json(
    { error: "insufficient_credits", balance: result.newBalance, required: 300 },
    { status: 402 }
  );
}

// On failure:
try {
  // ... generation logic
} catch (error) {
  await refundCredits(userId, 300, "Avatar generation failed - refund");
  // ... error response
}
```

### Error Response Pattern

```typescript
// 400 Bad Request
return NextResponse.json({ error: "Invalid expression type" }, { status: 400 });

// 402 Payment Required (insufficient credits)
return NextResponse.json({ error: "insufficient_credits", balance: 450, required: 800 }, { status: 402 });

// 403 Forbidden (tier restriction)
return NextResponse.json({ error: "upgrade_required", currentTier: "free", requiredTier: "start" }, { status: 403 });

// 404 Not Found
return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
```

---

## Questions? Ask the Lead

- Credit service function signatures → check `lib/services/credits.ts`
- DB table schemas → check `database/schema.ts`
- Adapter interface → check `lib/services/generation/types.ts`
- Any ambiguity → ask before implementing
