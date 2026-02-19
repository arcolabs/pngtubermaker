# Engineer C — Frontend Polish & Create Flow UI

> Assignee: Frontend Engineer (UI focus)
> Dependencies: Wait for skeleton commit from lead (Create Flow stepper shell + state management)
> Reference docs: [mvp-user-flow](./mvp-user-flow-20260219.md), [dev-plan](./dev-plan-20260219.md)

---

## Before You Start

1. Pull latest from `main`
2. Run `bun install && bun run dev`
3. Visit `/create` — you should see the stepper skeleton:
   - 4 steps visible in the step indicator
   - State machine transitions work (next/back)
   - Mock data populates each step
   - The UI is bare — **your job is to make it beautiful and functional**
4. Read [MVP User Flow Section 4](./mvp-user-flow-20260219.md#4-create-flow--core-generation-experience) for detailed wireframes

---

## Your Tasks

### Task 3.3-UI: Create Flow — Step UI Implementation

**Priority**: P2
**Estimate**: ~6h
**Context**: The lead has built:
- `app/(main)/create/page.tsx` — page shell with stepper
- `components/create/CreateStepper.tsx` — step indicator + state management
- `hooks/use-generation.ts` — generation state, API calls, credit checks

You build the **visual layer** for each step.

**Files to create/edit**:
```
components/create/StepDescribe.tsx      ← Step 1 UI
components/create/StepChooseBase.tsx    ← Step 2 UI
components/create/StepExpressions.tsx   ← Step 3 UI
components/create/StepDownload.tsx      ← Step 4 UI
```

---

#### StepDescribe.tsx (Step 1)

```
What user sees:
- Textarea for character description (use useAutoResizeTextarea hook)
- Style selector: two cards (Anime / Chibi), click to select
- Cost preview box showing: "300 🪙 character + 800 🪙 expressions = 1,100 🪙 total"
- Current balance display
- "Generate Character — 300 🪙" primary button
- If balance < 300: button disabled, show "Insufficient credits" + link to /pricing

Props from parent (CreateStepper):
- formState: { prompt: string, style: 'anime' | 'chibi' }
- onFormChange: (updates) => void
- onSubmit: () => void          // Triggers generation
- creditBalance: number
- isGenerating: boolean
```

**Design details**:
```tsx
// Style selector cards
<div className="grid grid-cols-2 gap-4">
  <button
    onClick={() => onFormChange({ style: 'anime' })}
    className={`card bg-base-200 p-6 text-center cursor-pointer transition-all
      ${style === 'anime' ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
  >
    <span className="text-3xl mb-2">🎨</span>
    <span className="font-semibold">Anime</span>
    <span className="text-sm text-base-content/60">Clean modern anime style</span>
  </button>
  {/* Same for Chibi with 🎀 icon */}
</div>

// Cost preview
<div className="bg-base-200 rounded-xl p-4 space-y-2">
  <div className="flex justify-between text-sm">
    <span>Character generation</span>
    <span>300 🪙</span>
  </div>
  <div className="flex justify-between text-sm">
    <span>Expression pack (4 expressions)</span>
    <span>800 🪙</span>
  </div>
  <div className="divider my-1" />
  <div className="flex justify-between font-semibold">
    <span>Total</span>
    <span>1,100 🪙</span>
  </div>
  <div className="flex justify-between text-xs text-base-content/50">
    <span>Your balance</span>
    <span>{creditBalance} 🪙</span>
  </div>
</div>

// Prompt tips (collapsible)
<div className="collapse collapse-arrow bg-base-200">
  <input type="checkbox" />
  <div className="collapse-title text-sm font-medium">Prompt Tips</div>
  <div className="collapse-content text-sm">
    <ul className="list-disc pl-4 space-y-1">
      <li>Be specific about hair color, eye color, clothing</li>
      <li>Mention accessories (headphones, glasses, hat)</li>
      <li>Describe personality traits for better expressions</li>
    </ul>
  </div>
</div>
```

---

#### StepChooseBase.tsx (Step 2)

```
What user sees:
- 4 candidate images in a 2x2 grid
- Click to select (highlight border + checkmark overlay)
- "Not happy? Regenerate — 300 🪙" link button
- "Generate Expressions — 800 🪙" primary button
- Back button

Props from parent:
- candidates: string[]           // 4 image URLs
- selectedIndex: number | null
- onSelect: (index: number) => void
- onRegenerate: () => void       // Costs 300 more credits
- onNext: () => void             // Proceed to expressions
- onBack: () => void
- creditBalance: number
- isRegenerating: boolean
```

**Design details**:
```tsx
// Image grid
<div className="grid grid-cols-2 gap-4">
  {candidates.map((url, i) => (
    <button
      key={i}
      onClick={() => onSelect(i)}
      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200
        ${selectedIndex === i
          ? 'ring-4 ring-primary shadow-[0_4px_30px_rgba(6,182,212,0.25)] scale-[1.02]'
          : 'hover:ring-2 hover:ring-primary/50 hover:shadow-md'
        }`}
    >
      <img src={url} alt={`Option ${i + 1}`} className="w-full h-full object-cover" />
      {selectedIndex === i && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
          <Check className="w-4 h-4" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Option {i + 1}
      </div>
    </button>
  ))}
</div>

// Regenerate link
<div className="text-center">
  <button
    onClick={onRegenerate}
    disabled={isRegenerating}
    className="btn btn-ghost btn-sm text-base-content/60"
  >
    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
    Not happy? Regenerate — 300 🪙
  </button>
</div>
```

---

#### StepExpressions.tsx (Step 3)

```
What user sees:
- 4 expression cards: Idle (base image) + Talking + Happy + Sad
- Idle is already complete (it's the selected base image)
- Others show progress: pending → generating (spinner) → completed (image)
- Images appear one by one as they complete
- Click completed expression → "Regenerate this? 200 🪙" confirm
- "Continue to Download" button (enabled when all complete)

Props from parent:
- baseImage: string
- expressions: Array<{
    id: string,
    type: string,
    status: 'pending' | 'generating' | 'completed' | 'failed',
    imageUrl?: string
  }>
- onRegenerate: (expressionId: string) => void
- onNext: () => void
- onBack: () => void
- isGenerating: boolean        // True while batch is in progress
```

**Design details**:
```tsx
// Expression card states
function ExpressionCard({ expression, isBase, onRegenerate }) {
  if (isBase) {
    // Idle — always completed, show base image with "Idle" label
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-success">
        <img src={expression.imageUrl} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 inset-x-0 bg-success/90 text-white text-center py-1 text-sm font-medium">
          Idle ✓
        </div>
      </div>
    );
  }

  if (expression.status === 'pending') {
    return (
      <div className="aspect-square rounded-xl bg-base-200 flex flex-col items-center justify-center">
        <span className="text-2xl mb-2">⏳</span>
        <span className="text-sm text-base-content/50 capitalize">{expression.type}</span>
        <span className="text-xs text-base-content/30">Waiting...</span>
      </div>
    );
  }

  if (expression.status === 'generating') {
    return (
      <div className="aspect-square rounded-xl bg-base-200 flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-sm font-medium capitalize">{expression.type}</span>
        <span className="text-xs text-base-content/50">Generating...</span>
      </div>
    );
  }

  if (expression.status === 'completed') {
    return (
      <div className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
           onClick={() => onRegenerate(expression.id)}>
        <img src={expression.imageUrl} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-center py-1 text-sm capitalize">
          {expression.type} ✓
        </div>
        {/* Hover overlay for regenerate */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
             transition-opacity flex items-center justify-center">
          <span className="text-white text-sm">🔄 Regenerate — 200 🪙</span>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="aspect-square rounded-xl bg-error/10 border border-error/30 flex flex-col items-center justify-center">
      <span className="text-2xl mb-2">❌</span>
      <span className="text-sm capitalize">{expression.type}</span>
      <button onClick={() => onRegenerate(expression.id)}
              className="btn btn-error btn-xs mt-2">
        Retry — 200 🪙
      </button>
    </div>
  );
}
```

**Overall progress bar** (above the grid):
```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Generating expressions...</span>
    <span>{completedCount}/{totalCount}</span>
  </div>
  <progress className="progress progress-primary w-full"
            value={completedCount} max={totalCount} />
</div>
```

---

#### StepDownload.tsx (Step 4)

```
What user sees:
- "Your PNGTuber is ready!" celebration header
- Name input field (default: "My PNGTuber")
- Preview grid of all expressions (2x2 or 1x4)
- Export size selector (radio buttons, locked sizes show 🔒)
- Download buttons: "Download ZIP" + "Download Individual PNGs"
- Quick Setup Guides (accordion)
- "Create Another" + "Go to My Avatars" buttons

Props from parent:
- avatar: { id, name, baseImage, expressions }
- userTier: 'free' | 'start' | 'pro'
- onNameChange: (name: string) => void
- onDownload: (format: 'zip' | 'individual', size: number) => void
```

**Design details**:
```tsx
// Celebration header
<div className="text-center space-y-2">
  <div className="text-4xl">🎉</div>
  <h2 className="text-2xl font-bold">Your PNGTuber is ready!</h2>
</div>

// Name input
<div className="form-control">
  <label className="label"><span className="label-text">Name your character</span></label>
  <input type="text" value={name} onChange={e => onNameChange(e.target.value)}
         className="input input-bordered w-full" placeholder="My PNGTuber" />
</div>

// Size selector
<div className="space-y-2">
  <label className="label"><span className="label-text">Export Size</span></label>
  {[
    { size: 512, label: '512×512', tier: 'free' },
    { size: 1080, label: '1080×1080', tier: 'start' },
    { size: 2160, label: '2160×2160 (4K)', tier: 'pro' },
  ].map(opt => {
    const locked = tierLevel(userTier) < tierLevel(opt.tier);
    return (
      <label key={opt.size} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer
        ${selectedSize === opt.size ? 'bg-primary/10 ring-1 ring-primary' : 'bg-base-200'}
        ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input type="radio" name="size" value={opt.size}
               disabled={locked} className="radio radio-primary radio-sm" />
        <span>{opt.label}</span>
        {locked && <span className="ml-auto text-xs">🔒 {opt.tier}+ only</span>}
      </label>
    );
  })}
</div>

// Download buttons
<div className="flex gap-3">
  <button onClick={() => onDownload('zip', selectedSize)}
          className="btn btn-primary flex-1">
    <Download className="w-4 h-4" /> Download ZIP
  </button>
  <button onClick={() => onDownload('individual', selectedSize)}
          className="btn btn-outline flex-1">
    <Download className="w-4 h-4" /> Individual PNGs
  </button>
</div>

// Quick Setup Guides
<div className="space-y-2">
  <h3 className="font-semibold">What's next?</h3>
  <div className="join join-vertical w-full">
    <div className="collapse collapse-arrow join-item bg-base-200">
      <input type="radio" name="guide" />
      <div className="collapse-title font-medium">
        Use with veadotube mini
      </div>
      <div className="collapse-content text-sm space-y-2">
        <p>1. Open veadotube mini</p>
        <p>2. Click the + button to add a new avatar</p>
        <p>3. Import your idle PNG as the "inactive" state</p>
        <p>4. Import your talking PNG as the "active" state</p>
        <p>5. Adjust the microphone sensitivity and you're live!</p>
      </div>
    </div>
    {/* Same pattern for PNGTuber Plus and Discord Reactive */}
  </div>
</div>

// Navigation
<div className="flex gap-3">
  <Link href="/create" className="btn btn-outline flex-1">Create Another</Link>
  <Link href="/avatars" className="btn btn-primary flex-1">Go to My Avatars</Link>
</div>
```

**Acceptance criteria for all 4 steps**:
- [ ] Matches wireframes in mvp-user-flow doc
- [ ] Smooth transitions between steps
- [ ] Loading states on all buttons during async operations
- [ ] Disabled states when conditions not met (e.g., no prompt, no selection)
- [ ] Credit costs clearly shown before every action
- [ ] Mobile responsive (single column on mobile)
- [ ] DaisyUI theme consistent (light mode, cyan primary)
- [ ] `bun run check` passes

---

### Task 4.1: Watermark System

**Priority**: P3
**Estimate**: ~2h
**New file**: `lib/services/watermark.ts`

```typescript
// Server-side function using Sharp
// Called in the download API when user is Free tier

import sharp from 'sharp';

export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  // 1. Create SVG text overlay:
  //    "PNGTuberMaker" in semi-transparent white
  //    Position: bottom-right corner
  //    Font size: ~5% of image width
  //    Opacity: 40%
  //
  // 2. Use sharp.composite() to overlay:
  //    sharp(imageBuffer)
  //      .composite([{ input: svgBuffer, gravity: 'southeast' }])
  //      .png()
  //      .toBuffer()

  // SVG approach (no external font needed):
  const svgText = `
    <svg width="300" height="40">
      <text x="10" y="30" font-family="sans-serif" font-size="24"
            fill="white" fill-opacity="0.4">PNGTuberMaker</text>
    </svg>
  `;

  return sharp(imageBuffer)
    .composite([{
      input: Buffer.from(svgText),
      gravity: 'southeast',
    }])
    .png()
    .toBuffer();
}
```

**Acceptance criteria**:
- [ ] Watermark visible but not obtrusive
- [ ] Works on transparent PNGs (doesn't flatten background)
- [ ] Scale-appropriate for different output sizes
- [ ] Only applied to Free tier downloads

---

### Task 4.3: Error Handling & Credit Refund UI

**Priority**: P3
**Estimate**: ~2h

Add toast notifications and error states throughout the app.

**Install**: DaisyUI already has toast support via `alert` component, or use `react-hot-toast`.

```typescript
// Recommendation: use react-hot-toast (bun add react-hot-toast)
import toast from 'react-hot-toast';

// Success
toast.success('Expression pack generated!');

// Error
toast.error('Generation failed. Credits have been refunded.');

// Credit warning
toast('Low credits! Only 200 🪙 remaining.', { icon: '⚠️' });
```

**Where to add**:
- Create Flow: generation failure → toast + UI error state
- Create Flow: credit refund → toast confirming refund
- Dashboard: API load failure → toast
- Download: network error → toast + retry
- Avatar delete: success → toast + redirect

**Acceptance criteria**:
- [ ] All async errors show user-friendly toast
- [ ] Credit refunds confirmed to user
- [ ] No raw error messages shown (e.g., no "500 Internal Server Error")
- [ ] Toast component added to root layout

---

### Task 4.4: Loading & Empty States

**Priority**: P3
**Estimate**: ~2h

Add skeleton loaders for all data-fetching components.

```tsx
// Skeleton card (for avatar grid)
function AvatarCardSkeleton() {
  return (
    <div className="card bg-base-200 animate-pulse">
      <div className="aspect-square bg-base-300 rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-base-300 rounded w-2/3" />
        <div className="h-3 bg-base-300 rounded w-1/2" />
      </div>
    </div>
  );
}

// Skeleton for CreditBar
function CreditBarSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-base-200 rounded-xl animate-pulse">
      <div className="h-6 bg-base-300 rounded w-32" />
      <div className="h-6 bg-base-300 rounded w-20" />
    </div>
  );
}
```

**Where to add**:
- Dashboard: skeleton cards while avatars load
- My Avatars list: skeleton grid
- Avatar detail: skeleton for expression images
- Create Flow Step 2: skeleton during generation (before candidates appear)
- Header: skeleton for credit balance

**Acceptance criteria**:
- [ ] All loading states use skeleton (not spinners, except buttons)
- [ ] Skeletons match the layout they replace (same dimensions)
- [ ] Smooth transition from skeleton to real content
- [ ] No layout shift when data loads

---

### Task 4.5: Mobile Responsive Polish

**Priority**: P3
**Estimate**: ~2h

Test all new pages at 375px width and fix issues.

**Checklist**:
- [ ] Dashboard: single column, CreditBar wraps gracefully
- [ ] Create Flow Step 1: textarea full width, style cards stack vertically on very small screens
- [ ] Create Flow Step 2: 2x2 grid maintained (images small but visible)
- [ ] Create Flow Step 3: 2x2 grid maintained
- [ ] Create Flow Step 4: buttons stack on mobile, size selector full width
- [ ] My Avatars: single column on mobile
- [ ] Avatar Detail: expression grid 2x2, buttons stack
- [ ] Header: hamburger menu works, credits visible
- [ ] Pricing: cards stack on mobile, top-up section wraps

**Key breakpoints** (Tailwind):
```
375px  — mobile (default)
640px  — sm: (large phone / small tablet)
768px  — md: (tablet)
1024px — lg: (desktop)
```

---

### Task 4.6: Quick Setup Guides

**Priority**: P3
**Estimate**: ~1h
**File**: `components/create/SetupGuides.tsx`

Already scaffolded in StepDownload. Fill in real content:

**veadotube mini guide**:
```
1. Download veadotube mini from itch.io (free)
2. Open the app and click the ＋ button
3. Import your *_idle.png as the "Inactive" image
4. Import your *_talking.png as the "Active" image
5. Set microphone sensitivity (recommended: 50-70%)
6. Add to OBS as a Window Capture
7. You're live! Your avatar will react to your voice
```

**PNGTuber Plus guide**:
```
1. Download PNGTuber Plus from GitHub (free)
2. Go to Settings → Add New Model
3. Import all expression PNGs
4. Map expressions to hotkeys or voice detection
5. Enable "Bounce" animation for a lively feel
6. Add to OBS as a Game Capture
```

**Discord Reactive Images guide**:
```
1. Go to discord.gg/reactiveimages
2. Link your Discord account
3. Upload idle.png as "Inactive" and talking.png as "Active"
4. Copy the browser source URL
5. Add to OBS as a Browser Source
6. Join a Discord voice channel to test
```

**Acceptance criteria**:
- [ ] Accordion opens/closes smoothly
- [ ] Steps are numbered and clear
- [ ] Links are real and working (veadotube itch.io page, PNGTuber Plus GitHub)
- [ ] Only one guide open at a time (radio accordion)

---

## General Notes

- Always use `className` not `class`
- All text content in English
- Use `lucide-react` for icons (Check, Download, Loader2, RefreshCw, Trash2, Plus, Sparkles, etc.)
- Follow existing patterns in `components/sections/` for styling reference
- When in doubt, match the wireframes in [mvp-user-flow](./mvp-user-flow-20260219.md)
