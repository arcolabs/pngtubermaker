# Engineer C — UI/UX Overhaul & Frontend Polish

> Assignee: Frontend Engineer (UI focus)
> Dependencies: All Engineer A + B tasks completed, code merged to main
> Reference: [mvp-user-flow](./mvp-user-flow-20260219.md), [dev-plan](./dev-plan-20260219.md)
> Visual Reference: `thumb-free/components/ai-image-generator/` — study its glass-morphism style, hover effects, and micro-animations
> Screenshot: `docs/screenshot-20260219-125944.png`

---

## Before You Start

1. Pull latest from `main` — all backend APIs, dashboard, avatars, and create flow are functional
2. Run `bun install && bun run dev`
3. Click through every page: `/dashboard`, `/create`, `/avatars`, `/pricing`
4. Study the reference component at `thumb-free/components/ai-image-generator/` — this is the quality bar
5. Our theme is **light mode** (not dark), but the same design principles apply: glass effects, subtle gradients, smooth micro-animations

**Quality bar**: YC-incubated product level (Linear, Vercel, Cal.com). Clean, spacious, intentional.

---

## Design System Upgrade

### Core Visual Language

The current codebase uses stock DaisyUI. Your job is to layer on a refined visual system:

```tsx
// ❌ Current: flat DaisyUI
<div className="bg-base-200 rounded-xl p-4">

// ✅ Target: glass-morphism with depth
<div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6
                border border-gray-200/60
                shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
```

### Card Hierarchy (3 levels)

```tsx
// Level 1: Page container (subtle, recessed)
"bg-base-100"

// Level 2: Content card (elevated, glass)
"bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl
 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]"

// Level 3: Interactive card (hover-aware, more elevation)
"bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl
 shadow-sm hover:shadow-md hover:border-primary/20
 transition-all duration-200"
```

### Primary CTA Button

```tsx
// ❌ Current
<button className="btn btn-primary">Generate</button>

// ✅ Target: gradient with glow
<button className="btn border-0 text-white
  bg-gradient-to-r from-primary to-cyan-400
  shadow-[0_4px_14px_rgba(6,182,212,0.35)]
  hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)]
  hover:scale-[1.02] active:scale-[0.98]
  transition-all duration-200">
  Generate
</button>
```

### Accent Colors

```
Primary:    #06b6d4 (cyan-500) — CTAs, selected states, links
Secondary:  #0891b2 (cyan-600) — gradient end
Success:    #10b981 — completed states
Warning:    #f59e0b — low credit alerts
Error:      #ef4444 — failures, destructive actions
Surface:    white/70 with backdrop-blur — cards
Border:     gray-200/60 — card edges
Text:       gray-900 (primary), gray-500 (secondary), gray-400 (muted)
```

---

## Task 0: Breadcrumb Navigation Component

**Priority**: P0 (do this first, used by all pages)
**New file**: `components/ui/Breadcrumb.tsx`

Create a reusable breadcrumb component used across all app pages.

```tsx
// Usage examples:
<Breadcrumb items={[
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create PNGTuber" },
]} />

<Breadcrumb items={[
  { label: "My Avatars", href: "/avatars" },
  { label: "Luna" },
]} />
```

**Design**:
```tsx
// Lightweight, not heavy — don't compete with page title
<nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
  {items.map((item, i) => (
    <Fragment key={i}>
      {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
      {item.href ? (
        <Link href={item.href}
              className="hover:text-primary transition-colors">
          {item.label}
        </Link>
      ) : (
        <span className="text-gray-700 font-medium">{item.label}</span>
      )}
    </Fragment>
  ))}
</nav>
```

**Where to add breadcrumbs**:

| Page | Breadcrumb |
|------|------------|
| `/dashboard` | `Dashboard` (just title, no breadcrumb needed) |
| `/create` | `Dashboard > Create PNGTuber` |
| `/avatars` | `Dashboard > My Avatars` |
| `/avatars/[id]` | `My Avatars > {avatar.name}` |
| `/pricing` | `Pricing` (standalone page, no breadcrumb) |

**Also**: Add active state to Header nav links. The current page should be visually highlighted:
```tsx
// In Header.tsx, detect current path and add:
className={pathname === "/dashboard"
  ? "text-primary font-medium"
  : "text-base-content/70 hover:text-primary"}
```

**Acceptance criteria**:
- [ ] Breadcrumb component is reusable across all pages
- [ ] Current page in header nav is highlighted
- [ ] Breadcrumbs use `<Link>` for clickable segments, plain `<span>` for current page
- [ ] Compact, doesn't compete with page title

---

## Task 1: /create Flow — Visual Overhaul

**Priority**: P1
**Estimate**: ~8h
**Goal**: Transform the create flow from "functional DaisyUI" to "polished product"

### 1A: Container & Step Indicator

**File**: `components/create/CreateStepper.tsx`

Replace the current DaisyUI `<ul className="steps">` with a custom step indicator:

```tsx
// Custom step indicator — cleaner than DaisyUI steps
<div className="flex items-center justify-between mb-10">
  {STEPS.map((step, i) => {
    const status = i < currentStepIndex ? "completed"
                 : i === currentStepIndex ? "current"
                 : "upcoming";
    return (
      <Fragment key={step.id}>
        {i > 0 && (
          <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors duration-500
            ${i <= currentStepIndex ? "bg-primary" : "bg-gray-200"}`} />
        )}
        <div className="flex flex-col items-center gap-1.5">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center
            text-sm font-semibold transition-all duration-300
            ${status === "completed"
              ? "bg-primary text-white"
              : status === "current"
                ? "bg-primary text-white shadow-[0_0_0_4px_rgba(6,182,212,0.15)]"
                : "bg-gray-100 text-gray-400"
            }`}>
            {status === "completed" ? <Check className="w-4 h-4" /> : step.number}
          </div>
          <span className={`text-xs font-medium hidden sm:block
            ${status === "current" ? "text-primary" : "text-gray-400"}`}>
            {step.label}
          </span>
        </div>
      </Fragment>
    );
  })}
</div>
```

**Outer container**: wrap the entire create flow in a glass card:
```tsx
<div className="max-w-3xl mx-auto px-4 py-8">
  <Breadcrumb items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Create PNGTuber" },
  ]} />

  {/* Step indicator */}
  ...

  {/* Step content — glass container */}
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8
                  border border-gray-200/60
                  shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
    {/* Render current step */}
  </div>
</div>
```

**Step transitions**: Add CSS transitions when switching steps. Use opacity + translateY:
```tsx
// Wrap step content in a transition container
<div className="min-h-[400px]"
     key={state.step}  // key change triggers re-mount
     style={{
       animation: "fadeInUp 0.3s ease-out",
     }}>
  {/* Step content */}
</div>

// Add to global CSS or a <style> tag:
// @keyframes fadeInUp {
//   from { opacity: 0; transform: translateY(12px); }
//   to   { opacity: 1; transform: translateY(0); }
// }
```

---

### 1B: StepDescribe — Prompt & Style Selection

**File**: `components/create/StepDescribe.tsx`

**Key changes**:

1. **Use auto-resize textarea** (hook already exists at `hooks/use-auto-resize-textarea.ts`):
```tsx
const { textareaRef } = useAutoResizeTextarea({ minHeight: 120, maxHeight: 240 });

<textarea
  ref={textareaRef}
  className="textarea w-full border-gray-200 focus:border-primary focus:ring-2
             focus:ring-primary/20 rounded-xl text-base resize-none
             transition-all duration-200"
  placeholder="A cute anime girl with long silver hair, blue eyes, wearing a purple hoodie with cat ears..."
/>
```

2. **Style cards with illustration feel** (not just emoji + text):
```tsx
<div className="grid grid-cols-2 gap-4">
  {[
    { id: "anime", label: "Anime", desc: "Clean modern anime style", icon: "🎨" },
    { id: "chibi", label: "Chibi", desc: "Super-deformed cute style", icon: "🎀" },
  ].map(s => (
    <button
      key={s.id}
      onClick={() => onStyleChange(s.id)}
      className={`group relative p-5 rounded-xl text-left transition-all duration-200
        ${style === s.id
          ? "bg-primary/5 border-2 border-primary shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
          : "bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }`}
    >
      <span className="text-2xl block mb-2">{s.icon}</span>
      <span className="font-semibold text-gray-900 block">{s.label}</span>
      <span className="text-sm text-gray-500">{s.desc}</span>
      {style === s.id && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full
                        flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  ))}
</div>
```

3. **Cost preview**: Keep the breakdown but refine styling:
```tsx
<div className="rounded-xl bg-gray-50 p-5 space-y-3">
  {/* ... cost rows ... */}
  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
    <span>Total</span>
    <span className="text-primary">{TOTAL_COST} credits</span>
  </div>
</div>
```

4. **CTA button**: Use gradient style:
```tsx
<button
  disabled={!canSubmit}
  onClick={onSubmit}
  className="btn w-full border-0 text-white text-base h-12
    bg-gradient-to-r from-primary to-cyan-400
    shadow-[0_4px_14px_rgba(6,182,212,0.35)]
    hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)]
    hover:scale-[1.01] active:scale-[0.99]
    disabled:opacity-50 disabled:shadow-none disabled:scale-100
    transition-all duration-200"
>
  {isGenerating ? (
    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
  ) : (
    <><Sparkles className="w-4 h-4" /> Generate Character — {CHARACTER_COST} credits</>
  )}
</button>
```

---

### 1C: StepChooseBase — Candidate Selection

**File**: `components/create/StepChooseBase.tsx`

**Key changes**:

1. **Image cards with hover overlay** (reference: AIImageGeneratorResultCard from thumb-free):
```tsx
<button
  onClick={() => onSelect(i)}
  className={`group relative aspect-square rounded-xl overflow-hidden
    transition-all duration-300
    ${selectedIndex === i
      ? "ring-[3px] ring-primary shadow-[0_4px_20px_rgba(6,182,212,0.25)] scale-[1.02]"
      : "ring-1 ring-gray-200 hover:ring-gray-300"
    }`}
>
  <img src={url} alt={`Option ${i + 1}`}
       className="w-full h-full object-cover transition-transform duration-500
                  group-hover:scale-105" />

  {/* Hover gradient overlay — always present, fades in */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  {/* Bottom label */}
  <div className="absolute bottom-0 inset-x-0 p-3
                  translate-y-full group-hover:translate-y-0
                  transition-transform duration-300">
    <span className="text-white text-sm font-medium">Option {i + 1}</span>
  </div>

  {/* Selection checkmark */}
  {selectedIndex === i && (
    <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full
                    flex items-center justify-center shadow-lg
                    animate-[scaleIn_0.2s_ease-out]">
      <Check className="w-4 h-4 text-white" />
    </div>
  )}
</button>
```

2. **Staggered entrance animation** when candidates first load:
```tsx
// Each card fades in with a delay
<div style={{ animationDelay: `${i * 100}ms` }}
     className="animate-[fadeInUp_0.4s_ease-out_both]">
  {/* card content */}
</div>
```

---

### 1D: StepExpressions — Generation Progress

**File**: `components/create/StepExpressions.tsx`

**Key changes**:

1. **Progress section** — replace DaisyUI progress bar with a refined version:
```tsx
<div className="space-y-3 mb-6">
  <div className="flex justify-between text-sm">
    <span className="text-gray-600 font-medium">
      {isGenerating ? "Generating expressions..." : "All expressions ready"}
    </span>
    <span className="text-primary font-semibold">{completedCount}/{totalCount}</span>
  </div>
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full
                    transition-all duration-700 ease-out"
         style={{ width: `${(completedCount / totalCount) * 100}%` }} />
  </div>
</div>
```

2. **Expression cards** — generating state should pulse with shimmer, not flat animate-pulse:
```tsx
// Generating state: shimmer effect
<div className="aspect-square rounded-xl overflow-hidden relative bg-gray-100">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent
                  -translate-x-full animate-[shimmer_1.5s_infinite]" />
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
    <span className="text-sm font-medium capitalize text-gray-700">{type}</span>
  </div>
</div>

// CSS keyframe (add to global styles):
// @keyframes shimmer {
//   to { transform: translateX(200%); }
// }
```

3. **Completed expression** — fade in with scale:
```tsx
className="animate-[fadeInScale_0.3s_ease-out]"
// @keyframes fadeInScale {
//   from { opacity: 0; transform: scale(0.95); }
//   to   { opacity: 1; transform: scale(1); }
// }
```

---

### 1E: StepDownload — Celebration & Export

**File**: `components/create/StepDownload.tsx`

**Key changes**:

1. **Celebration header** — subtle confetti animation or animated gradient text:
```tsx
<div className="text-center space-y-3 py-4">
  <div className="text-5xl animate-bounce">🎉</div>
  <h2 className="text-2xl sm:text-3xl font-bold
                 bg-gradient-to-r from-primary to-cyan-400
                 bg-clip-text text-transparent">
    Your PNGTuber is ready!
  </h2>
  <p className="text-gray-500">Name your character and download the expression pack</p>
</div>
```

2. **Expression preview grid** — horizontal scroll on mobile, grid on desktop:
```tsx
<div className="flex sm:grid sm:grid-cols-4 gap-3 overflow-x-auto pb-2 sm:pb-0
                snap-x snap-mandatory sm:snap-none">
  {expressions.filter(e => e.status === "completed" && e.imageUrl).map(expr => (
    <div key={expr.id}
         className="flex-shrink-0 w-24 sm:w-auto snap-center">
      <div className="aspect-square rounded-xl overflow-hidden ring-1 ring-gray-200">
        <img src={expr.imageUrl} alt={expr.type}
             className="w-full h-full object-cover" />
      </div>
      <p className="text-center text-xs text-gray-500 mt-1.5 capitalize font-medium">
        {expr.type}
      </p>
    </div>
  ))}
</div>
```

3. **Download CTA** — prominent gradient button (same style as generate):
```tsx
<button className="btn w-full border-0 text-white h-12
  bg-gradient-to-r from-primary to-cyan-400
  shadow-[0_4px_14px_rgba(6,182,212,0.35)]
  hover:shadow-[0_6px_20px_rgba(6,182,212,0.45)]
  hover:scale-[1.01] active:scale-[0.99]
  transition-all duration-200">
  <Download className="w-4 h-4" />
  {isDownloading ? "Preparing..." : "Download ZIP"}
</button>
```

**Acceptance criteria for Task 1 (all sub-tasks)**:
- [ ] Glass-morphism container wraps the create flow
- [ ] Custom step indicator with progress line (not DaisyUI steps)
- [ ] Step transitions animate (fadeInUp, 0.3s)
- [ ] Candidate images have hover overlay + staggered entrance
- [ ] Expression progress uses gradient bar + shimmer loading
- [ ] All CTAs use gradient button style
- [ ] Auto-resize textarea used in Step 1
- [ ] Mobile responsive (375px)
- [ ] `bun run check` passes

---

## Task 2: /dashboard — Visual Upgrade

**Priority**: P1
**Estimate**: ~4h
**Goal**: Dashboard should feel like a command center, not a plain list

### 2A: Page Layout

**File**: `app/(main)/dashboard/page.tsx`

Add breadcrumb (just title — dashboard is root) and refine spacing:

```tsx
<div className="min-h-screen bg-base-100">
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
    {/* Greeting — keep but add time-based greeting */}
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        {getGreeting()}, {name}
      </h1>
      <p className="text-gray-500 mt-1">
        Here's your PNGTuber studio overview
      </p>
    </div>

    {/* Credit bar + Quick action — side by side on desktop */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <CreditBar ... />
      </div>
      <QuickActionCard />
    </div>

    {/* Avatars */}
    ...

    {/* Usage Stats */}
    ...
  </div>
</div>
```

Helper:
```tsx
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
```

### 2B: CreditBar Upgrade

**File**: `components/dashboard/CreditBar.tsx`

```tsx
// Glass card, cleaner hierarchy
<div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6
                border border-gray-200/60
                shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
    {/* Balance */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-cyan-400/10
                      flex items-center justify-center">
        <Coins className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Credits</p>
        <p className="text-2xl font-bold text-gray-900">
          {totalCredits.toLocaleString()}
        </p>
      </div>
    </div>

    {/* Tier badge */}
    <div className="sm:ml-auto">
      {tier === "pro" ? (
        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white
                         bg-gradient-to-r from-primary to-cyan-400">PRO</span>
      ) : tier === "start" ? (
        <span className="px-3 py-1 rounded-full text-xs font-semibold text-primary
                         bg-primary/10">START</span>
      ) : (
        <span className="px-3 py-1 rounded-full text-xs font-semibold text-gray-500
                         bg-gray-100">FREE</span>
      )}
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Link href="/pricing#topup"
            className="btn btn-sm btn-outline border-gray-200 hover:border-primary
                       hover:text-primary">
        Top Up
      </Link>
      {tier !== "pro" && (
        <Link href="/pricing"
              className="btn btn-sm border-0 text-white
                         bg-gradient-to-r from-primary to-cyan-400
                         hover:shadow-md transition-all">
          Upgrade
        </Link>
      )}
    </div>
  </div>
</div>
```

### 2C: Quick Action Card (Create CTA)

Replace the plain card with a visually prominent CTA:

```tsx
<div className="bg-gradient-to-br from-primary/5 to-cyan-400/5
                border border-primary/10 rounded-2xl p-6
                flex flex-col items-center justify-center text-center
                hover:shadow-md hover:border-primary/20
                transition-all duration-200 group">
  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-200 mb-3">
    <Sparkles className="w-6 h-6 text-primary" />
  </div>
  <h3 className="font-semibold text-gray-900 mb-1">Create PNGTuber</h3>
  <p className="text-sm text-gray-500 mb-4">Generate a new avatar with expressions</p>
  <Link href="/create"
        className="btn btn-sm border-0 text-white
                   bg-gradient-to-r from-primary to-cyan-400">
    Get Started
  </Link>
</div>
```

### 2D: AvatarCard Upgrade

**File**: `components/dashboard/AvatarCard.tsx`

Add hover depth:
```tsx
<Link href={`/avatars/${avatar.id}`}
      className="group block bg-white rounded-xl border border-gray-200/60 overflow-hidden
                 hover:shadow-md hover:border-gray-300/60
                 transition-all duration-200">
  <figure className="aspect-square overflow-hidden bg-gray-50">
    {avatar.thumbnailUrl ? (
      <img src={avatar.thumbnailUrl} alt={avatar.name}
           className="w-full h-full object-cover
                      transition-transform duration-500 group-hover:scale-105" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-gray-300">
        <span className="text-3xl">🎭</span>
      </div>
    )}
  </figure>
  <div className="p-3">
    <h3 className="font-medium text-gray-900 truncate">{avatar.name}</h3>
    <p className="text-xs text-gray-400 mt-0.5">
      {avatar.expressionCount} expressions · {formatRelativeTime(avatar.createdAt)}
    </p>
  </div>
</Link>
```

### 2E: UsageStats Upgrade

**File**: `components/dashboard/UsageStats.tsx`

Use gradient progress bar (same as expressions) + better spacing:
```tsx
<div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6
                border border-gray-200/60
                shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
  <h3 className="font-semibold text-gray-900 mb-4">This Month</h3>
  <div className="space-y-4">
    {/* Progress bar */}
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500">Credits used</span>
        <span className="font-semibold text-gray-900">
          {creditsUsed.toLocaleString()} / {monthlyLimit.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out
          ${percentage > 80
            ? "bg-gradient-to-r from-red-400 to-red-500"
            : percentage > 50
              ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : "bg-gradient-to-r from-primary to-cyan-400"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
    {/* Stats row */}
    <div className="flex gap-6 text-sm">
      <div>
        <span className="text-gray-400">Avatars created</span>
        <span className="block font-semibold text-gray-900">{avatarsCreated}</span>
      </div>
      {periodEnd && (
        <div>
          <span className="text-gray-400">Resets</span>
          <span className="block font-semibold text-gray-900">
            {new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      )}
    </div>
  </div>
</div>
```

**Acceptance criteria for Task 2**:
- [ ] Dashboard cards use glass-morphism style (bg-white/70 + backdrop-blur + shadow)
- [ ] CreditBar tier badges use color-coded pills (not DaisyUI badge)
- [ ] Quick Action card has gradient accent + hover effect
- [ ] AvatarCard has hover scale + shadow transition
- [ ] Usage progress bar uses gradient colors
- [ ] Time-based greeting (morning/afternoon/evening)
- [ ] Mobile responsive

---

## Task 3: /avatars — List & Detail Polish

**Priority**: P1
**Estimate**: ~3h

### 3A: Avatar List Page

**File**: `app/(main)/avatars/page.tsx`

Add breadcrumb and refine grid:
```tsx
<Breadcrumb items={[
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Avatars" },
]} />

<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-gray-900">My Avatars</h1>
  <Link href="/create"
        className="btn btn-sm border-0 text-white
                   bg-gradient-to-r from-primary to-cyan-400">
    <Plus className="w-4 h-4" /> Create New
  </Link>
</div>
```

Grid uses the same AvatarCard component from dashboard (upgraded in Task 2D).

### 3B: Avatar Detail Page

**File**: `app/(main)/avatars/[id]/page.tsx`, `components/avatars/AvatarDetailClient.tsx`

Add breadcrumb:
```tsx
<Breadcrumb items={[
  { label: "My Avatars", href: "/avatars" },
  { label: avatar.name },
]} />
```

**Expression grid** — same hover overlay pattern as StepChooseBase:
- Completed expressions show hover overlay with "Regenerate" option
- Failed expressions show error state with "Retry" button
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4`

**Download section** — clean card:
```tsx
<div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6
                border border-gray-200/60 shadow-sm">
  <h3 className="font-semibold text-gray-900 mb-4">Download</h3>
  <div className="flex flex-wrap items-center gap-3">
    <select className="select select-bordered select-sm bg-white">
      <option value={512}>512×512</option>
      <option value={1080}>1080×1080</option>
      <option value={2160}>2160×2160 (4K)</option>
    </select>
    <button className="btn btn-sm border-0 text-white
                       bg-gradient-to-r from-primary to-cyan-400">
      <Download className="w-4 h-4" /> Download ZIP
    </button>
  </div>
</div>
```

**Delete** — destructive action should feel dangerous:
```tsx
<button className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600">
  <Trash2 className="w-4 h-4" /> Delete
</button>
```

**Acceptance criteria for Task 3**:
- [ ] Breadcrumbs on both list and detail pages
- [ ] Expression images have hover overlay
- [ ] Download card uses glass style
- [ ] Delete button looks destructive (red tint)
- [ ] Back navigation via breadcrumb

---

## Task 4: Global CSS Keyframes

**Priority**: P1 (dependency for Tasks 1-3)
**File**: `app/globals.css`

Add these animation keyframes used across all upgraded components:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmer {
  to {
    transform: translateX(200%);
  }
}
```

Then use in Tailwind via arbitrary values: `animate-[fadeInUp_0.3s_ease-out]`

---

## Task 5: Watermark System

**Priority**: P3
**File**: `lib/services/watermark.ts`

(Same as original Task 4.1 — unchanged)

Implement `applyWatermark(imageBuffer: Buffer): Promise<Buffer>` using sharp.composite() with SVG text overlay. Position: bottom-right, opacity 40%, font-size scales with image.

**Acceptance criteria**:
- [ ] Watermark visible but not obtrusive on transparent PNGs
- [ ] Scale-appropriate for 512/1080/2160 outputs
- [ ] Only called in download route for Free tier

---

## Task 6: Error Handling & Toasts

**Priority**: P3
**Estimate**: ~2h

Install `react-hot-toast` (or use DaisyUI alerts):
```bash
bun add react-hot-toast
```

Add `<Toaster />` to root layout. Then add toasts for:
- Generation failure → "Generation failed. Credits refunded."
- Download error → "Download failed. Please try again."
- Delete success → "Avatar deleted."
- Low credits → "Low credits! Only X remaining."
- Network error → "Connection lost. Please check your internet."

**Acceptance criteria**:
- [ ] All async errors show toast (no raw error text)
- [ ] Credit refunds confirmed via toast
- [ ] Toast component in root layout
- [ ] Consistent toast styling

---

## Task 7: Loading States & Skeletons

**Priority**: P3
**Estimate**: ~2h

All loading states should use skeleton with the shimmer animation (same `@keyframes shimmer`):

```tsx
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent
                        -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}
```

Where to use:
- Dashboard avatar grid: 3 skeleton cards while loading
- Avatars list: 6 skeleton cards
- Avatar detail: skeleton for expression images
- CreditBar: skeleton row
- Header credit display: "..." → actual number

---

## Task 8: Mobile Responsive Polish

**Priority**: P3
**Estimate**: ~2h

Test all pages at 375px (iPhone SE). Key checks:

| Page | Mobile Behavior |
|------|-----------------|
| Dashboard | Single column, CreditBar stacks, greeting text smaller |
| Create Step 1 | Full-width textarea, style cards side-by-side (they're small enough) |
| Create Step 2 | 2×2 grid maintained (each ~160px) |
| Create Step 3 | 2×2 grid maintained |
| Create Step 4 | Horizontal scroll for expression preview, buttons stack |
| Avatars List | Single column cards |
| Avatar Detail | 2×2 expression grid, buttons wrap |
| Header | Hamburger menu, no credit display (show in dropdown instead) |

---

## Task 9: Quick Setup Guides Content

**Priority**: P3
**Estimate**: ~1h
**File**: `components/create/SetupGuides.tsx`

Fill in real content for veadotube mini, PNGTuber Plus, and Discord Reactive Image guides. See the detailed content in the original task document (same content, just implement it).

---

## Execution Order

```
Task 4 (Global CSS)        ← Do first, dependency for animations
Task 0 (Breadcrumb)        ← Do second, used by all pages
Task 1 (Create Flow)       ← Biggest impact
Task 2 (Dashboard)         ← Second biggest
Task 3 (Avatars)           ← Third
Task 6 (Toasts)            ← Quick win
Task 7 (Skeletons)         ← Quick win
Task 8 (Mobile)            ← Test pass
Task 5 (Watermark)         ← Independent
Task 9 (Setup Guides)      ← Content only
```

---

## Rules

1. **No new dependencies** except `react-hot-toast` (Task 6). Everything else is CSS + Tailwind.
2. **Keep DaisyUI base** — we're layering refinement on top, not replacing DaisyUI entirely.
3. **Light theme only** — all glass effects should use `white/70`, `gray-200/60`, not dark mode variants.
4. **Test at 375px** — every change must look good on mobile.
5. **Don't break functionality** — UI-only changes. Don't modify hooks, APIs, or state logic.
6. **`bun run check` must pass** before declaring any task done.
7. **Commit frequently** — one commit per task, descriptive message.

---

## Questions? Ask the Lead

- Design ambiguity → refer to thumb-free screenshots and source code
- Animation performance → use `transform` and `opacity` only (GPU-accelerated)
- If unsure about a pattern → keep it simple, less is more
