# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thumb-Free is a **free, unlimited AI YouTube thumbnail generator** built with Next.js 16, React 19, and Tailwind CSS v4. The core value proposition is "100% Free. Unlimited Forever." - no hidden fees, no credits, no limits.

**Key positioning:** The world's first completely free, unlimited AI thumbnail engine built to help creators grow their channels.

## Tech Stack

- **Framework:** Next.js 16.1.3 (App Router)
- **React:** 19.2.3
- **Styling:** Tailwind CSS v4.1.18 (inline theme in `app/globals.css`)
- **Fonts:** Geist Sans (body), Geist Mono (code/numbers)
- **Linting/Formatting:** Biome 2.2.0
- **Database:** Neon (PostgreSQL) with Drizzle ORM
- **Auth:** better-auth 1.4.18

## Development Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run check        # Run Biome linter
npm run format       # Format code with Biome
```

## Design System

### Color Theme (Dark Mode Only)

The site is **always dark mode** (`<html lang="en" className="dark">` in `app/layout.tsx`).

- **Background:** Pure black `#000000`
- **Primary (YouTube red):** `#FF0000` / `#FF0033` / `#FF3355` (gradient)
- **Primary hover:** `#FF5555` / `#FF2244`
- **Card background:** Transparent with `bg-white/5` or `bg-white/10`
- **Border:** `white/10` (default), `white/20` (hover)
- **Text headings:** `#ffffff` with gradient option
- **Text body:** `#FFFFFF80` (80% opacity white) or `white/60`

### Typography

- **Font family:** Geist Sans (variable font)
- **Headings gradient:** `radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)`
- Use `bg-clip-text text-transparent` with inline style for gradient text
- **Monospace:** Geist Mono for numbers and badges

### Card/Component Pattern (Tech Style)

Cards use a consistent glass-morphism tech style:

```tsx
className="group relative rounded-2xl overflow-hidden
           border border-white/10 
           shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
           hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)]
           hover:border-white/20
           hover:bg-white/10
           transition-all duration-300 ease-in-out"
```

**Gradient border overlay (optional):**
```tsx
<div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
```

**Number badge (top-right corner):**
```tsx
<div className="absolute top-4 right-4 text-xs font-mono text-white/20 group-hover:text-primary/40 transition-colors duration-300">
  {String(index + 1).padStart(2, "0")}
</div>
```

### Button Patterns

**Primary CTA Button (Hero):**
```tsx
<Link
  className="group relative inline-flex items-center gap-3 rounded-2xl 
             bg-gradient-to-r from-[#FF0033] via-[#FF2244] to-[#FF3355]
             px-8 sm:px-10 py-4 sm:py-5
             transition-all duration-300 ease-out
             hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#FF0033]/30
             active:scale-[0.98] active:duration-100
             border border-white/20 hover:border-white/30
             overflow-hidden"
>
  {/* Animated shine effect */}
  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                bg-gradient-to-r from-transparent via-white/20 to-transparent 
                transition-transform duration-1000 ease-in-out" />
  
  {/* Glow effect */}
  <div className="absolute inset-0 rounded-2xl bg-[#FF0033]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
  
  {/* Icon */}
  <svg className="relative w-5 h-5 text-white/90 group-hover:text-white group-hover:rotate-12 transition-all duration-300">
    {/* Icon content */}
  </svg>
  
  <span className="relative font-bold text-lg sm:text-xl text-white tracking-wide">
    Button Text
  </span>
  
  {/* Tag/Badge */}
  <span className="relative rounded-full bg-white/25 backdrop-blur-sm px-3 py-1.5 text-sm font-bold text-white border border-white/40">
    Free
  </span>
  
  {/* Arrow */}
  <svg className="relative w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
    {/* Arrow icon */}
  </svg>
</Link>
```

**Tech Badge (Benefits/Tags):**
```tsx
<span className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl 
               text-sm font-medium text-white/80 
               bg-white/5 backdrop-blur-sm border border-white/10
               hover:bg-white/10 hover:border-white/20 
               hover:text-white
               shadow-[inset_0_0_16px_rgba(240,247,245,0.05)]
               hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
               transition-all duration-300 ease-out whitespace-nowrap">
  <span className="text-[10px] font-mono text-white/30 group-hover:text-primary/50 transition-colors">
    {String(index + 1).padStart(2, '0')}
  </span>
  <span className="text-base group-hover:scale-110 transition-transform duration-300">{icon}</span>
  <span className="tracking-wide">{label}</span>
</span>
```

### Hover Effects

- **Links:** `hover:text-[#FF5555]` (red)
- **Icons/accents:** `group-hover:text-primary` or `group-hover:text-[#FF0033]`
- **Border glow:** `hover:border-primary/30` or `hover:border-[#FF5555]/50`
- **Scale:** `hover:scale-[1.02]` or `hover:scale-[1.03]` for buttons
- **Shadow:** `hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)]`
- **Image zoom:** `group-hover:scale-110 transition-transform duration-700`

### User Count Badge

```tsx
<div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-wide duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 shadow-[inset_0_0_16px_rgba(240,247,245,0.1)] hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.15)] transition-all">
  {/* Live indicator */}
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0033] opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0033]"></span>
  </span>
  <span className="text-[#FFFFFF80]">Trusted by</span>
  <span className="font-bold tabular-nums text-base" style={{ color: "#FF0000" }}>
    {count}
  </span>
  <span className="text-[#FFFFFF80]">Users</span>
</div>
```

## Architecture

### App Structure

```
app/
├── layout.tsx              # Root layout with Header/Footer
├── page.tsx                # Landing page (Hero → Showcase → Features → TargetAudience → Testimonials → FAQ → CTA)
├── globals.css             # Tailwind v4 inline theme
├── legal/
│   ├── terms/page.tsx
│   └── privacy/page.tsx
└── youtube-thumbnail-grabber/
    └── page.tsx            # Separate tool page

components/
├── layout/
│   ├── Header.tsx          # Sticky nav with blur backdrop
│   └── Footer.tsx          # Links, tools, newsletter
├── sections/               # Landing page sections
│   ├── Hero.tsx            # CTA button, badge, headline
│   ├── Showcase.tsx        # Video demo + benefit badges
│   ├── Features.tsx        # Feature cards with images (2+3 grid)
│   ├── TargetAudience.tsx  # Audience cards with icons
│   ├── Testimonials.tsx    # 3-column testimonial cards
│   ├── FAQ.tsx             # Accordion FAQ
│   └── CTA.tsx             # Call-to-action with gradient bg
├── ui/
│   ├── UserCountBadge.tsx  # Animated user count with live indicator
│   └── Breadcrumb.tsx
└── sections/
    ├── YouTubeThumbnailGrabber.tsx      # Main tool component
    ├── YouTubeThumbnailGrabberHero.tsx  # Tool page hero
    └── StealModeShowcase.tsx            # Feature showcase
```

### Component Patterns

**Section components** (`components/sections/`) are reusable with props:
- Most accept `title`, `description`, and data arrays as props
- Use `memo` for performance optimization on list items
- Include `id` attributes for anchor navigation
- Follow the tech-style card pattern above

**Example pattern:**
```tsx
interface SectionProps {
  title?: string;
  description?: string;
  data?: ItemType[];
}

// Use memo for list items
const ItemCard = memo(function ItemCard({ item, index }: { item: ItemType; index: number }) {
  return (
    <div className="group relative rounded-2xl ...">
      <div className="absolute top-4 right-4 text-xs font-mono ...">
        {String(index + 1).padStart(2, '0')}
      </div>
      {/* Card content */}
    </div>
  );
});
```

### Page Layout Pattern

Pages compose sections in this typical order:
```tsx
<>
  <Hero />
  <Showcase videoSrc="/videos/Thumbfree.mp4" />
  <Features />
  <TargetAudience />
  <Testimonials />
  <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <FAQ />
  </div>
  <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8">
    <CTA />
  </div>
</>
```

## Key Conventions

### Spacing

- **Section padding:** `py-20 sm:py-28 lg:py-32`
- **Container padding:** `px-4 sm:px-6 lg:px-8`
- **Card gap:** `gap-3 sm:gap-4` (compact grid)
- **Content wrapper:** `max-w-7xl mx-auto`

### Grid Patterns

- **2 columns:** `grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4`
- **3 columns:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`
- **Benefits row:** `flex flex-wrap items-center justify-center gap-3 sm:gap-4`

### Navigation Anchors

Section IDs for nav links:
- `#features`
- `#how-it-works`
- `#pricing`
- `#target-audience`

All sections should have `scroll-mt-16` to account for sticky header:
```tsx
<section id="features" className="scroll-mt-16">
```

### Image Handling

- Use `next/image` with `fill` prop for responsive images
- Include `loading="lazy"` on below-fold images
- Add eager loading for first 8 images in carousels
- For feature images:
  - **~16:9:** `aspect-video`
  - **~4:3:** `aspect-[4/3]`

### Animations

**Scroll animations (CSS):**
```css
.animate-scroll-left {
  animation: scroll-left 150s linear infinite;
}
.animate-scroll-right {
  animation: scroll-right 90s linear infinite;
}
```

**Hover transitions:**
- Duration: `duration-300` (default), `duration-500` (slower), `duration-700` (images)
- Easing: `ease-in-out` (default), `ease-out` (buttons)
- Scale: `hover:scale-[1.02]` or `hover:scale-110`

**Live indicator:**
```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0033] opacity-75"></span>
  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0033]"></span>
</span>
```

## Content Guidelines

When writing copy for this product:

1. **Lead with free/unlimited** - this is the core differentiator
2. **Use direct, action-oriented language** - "Generate thumbnails" not "Thumbnail generation"
3. **Emphasize simplicity** - "Title + Photo = Pro Thumbnail"
4. **Reference YouTube/platform context** - CTR, views, shorts, etc.
5. **Avoid generic filler** - every component should reinforce the value prop
6. **Use emoji sparingly** - only in benefit badges (🎁, ⚡, 🔓, ∞)

## Agent Work Guidelines

As the Technical Co-Founder for this project, follow these principles when working with the product owner:

### Project Phases

**1. Discovery**
- Ask questions to understand what the owner actually needs (not just what they said)
- Challenge assumptions if something doesn't make sense
- Help separate "must have now" from "add later"
- Suggest smarter starting points if ideas are too big

**2. Planning**
- Propose exactly what to build in version 1
- Explain technical approach in plain language (no jargon)
- Estimate complexity (simple, medium, ambitious)
- Identify accounts, services, and decisions needed
- Show rough outline of finished product

**3. Building**
- Build in stages the owner can see and react to
- Explain what you're doing as you go (teach)
- Test everything before moving on
- Stop and check in at key decision points
- Present options instead of just picking one when problems arise

**4. Polish**
- Make it look professional, not like a hackathon project
- Handle edge cases and errors gracefully
- Ensure it's fast and works on different devices
- Add small details that make it feel "finished"

**5. Handoff**
- Deploy if the owner wants it online
- Give clear instructions for use, maintenance, and changes
- Document everything so owner isn't dependent on this conversation
- Suggest improvements for version 2

### How to Work with the Owner

- **Product owner role**: They make decisions, you make them happen
- **No jargon**: Translate everything to plain language
- **Push back**: Speak up if owner is overcomplicating or going down a bad path
- **Be honest**: Better to adjust expectations than be disappointed
- **Move fast**, but not so fast that owner can't follow

### Rules

- Build something the owner is **proud to show people**
- This is **real** - not a mockup, not a prototype, a working product
- Keep owner **in control and in the loop** at all times
- Focus on **delivering value** quickly and iteratively

## Notes

- The site uses `tw-animate-css` for additional animations
- All sections use `overflow-hidden` on parent containers
- Hover states use `group` pattern for coordinated child element effects
- The `scroll-mt-16` class on section anchors accounts for sticky header
- Use `will-change: transform` on animated elements for performance
- Prefer `gap-3 sm:gap-4` over larger gaps for modern compact look
- Always include `aria-hidden` on decorative elements
- Use `aria-label` on interactive elements without visible text
