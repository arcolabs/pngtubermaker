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
- **Primary (YouTube red):** `#FF0000` / `#FF5555` (hover)
- **Card background:** `#1A1A1A`
- **Border:** `#2A2A2A` or `white/10` (semi-transparent)
- **Text headings:** `#ffffff`
- **Text body:** `#ffffff80` (80% opacity white)

### Typography

- **Font family:** Geist Sans (variable font)
- **Headings gradient:** `radial-gradient(at 50% 0%, rgb(255, 0, 0) 5%, rgb(240, 247, 245) 50%)`
- Use `bg-clip-text text-transparent` with inline style for gradient text

### Card/Component Pattern

Cards follow this consistent pattern:
```tsx
className="group relative rounded-2xl overflow-hidden
           border border-white/10
           shadow-[inset_0_0_16px_rgba(240,247,245,0.1)]
           hover:shadow-[inset_0_0_16px_rgba(240,247,245,0.2)]
           hover:border-white/20
           hover:bg-white/10
           transition-all duration-300 ease-in-out"
```

Add optional number badge (top-right corner):
```tsx
<div className="absolute top-4 right-4 text-xs font-mono text-white/20 group-hover:text-primary/40 transition-colors duration-300">
  {String(index + 1).padStart(2, "0")}
</div>
```

### Hover Effects

- **Links:** `hover:text-[#FF5555]` (red)
- **Icons/accents:** `group-hover:text-primary` or `group-hover:text-[#FF0033]`
- **Border glow:** `hover:border-primary/30` or `hover:border-[#FF5555]/50`

## Architecture

### App Structure

```
app/
├── layout.tsx              # Root layout with Header/Footer
├── page.tsx                # Landing page (Hero → Showcase → Features → Testimonials → FAQ → CTA)
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
│   ├── Hero.tsx
│   ├── Showcase.tsx        # Video demo
│   ├── Features.tsx        # Feature cards with images
│   ├── TargetAudience.tsx  # Audience cards with icons
│   ├── Testimonials.tsx    # 3-column testimonial cards
│   ├── FAQ.tsx             # Accordion FAQ
│   └── CTA.tsx             # Call-to-action with gradient bg
├── ui/
│   ├── UserCountBadge.tsx  # Animated user count
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

**Example pattern:**
```tsx
interface SectionProps {
  title?: string;
  description?: string;
  data?: ItemType[];
}
```

### Page Layout Pattern

Pages compose sections in this typical order:
```tsx
<>
  <Hero />
  <Showcase videoSrc="/videos/Thumbfree.mp4" />
  <Features />
  <section id="how-it-works" className="scroll-mt-16" />
  <section id="pricing" className="scroll-mt-16" />
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
- **Container gap:** `gap-3 sm:gap-4` or `gap-6 sm:gap-8`
- **Content wrapper:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### Grid Patterns

- **2 columns:** `grid-cols-1 md:grid-cols-2`
- **3 columns:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### Navigation Anchors

Section IDs for nav links:
- `#features`
- `#how-it-works`
- `#pricing`
- `#target-audience` (if section included)

### Image Handling

- Use `next/image` with `fill` prop for responsive images
- Include `loading="lazy"` on below-fold images
- For feature images with known aspect ratios:
  - **~16:9:** `aspect-video`
  - **~4:3:** `aspect-[4/3]`

## Content Guidelines

When writing copy for this product:

1. **Lead with free/unlimited** - this is the core differentiator
2. **Use direct, action-oriented language** - "Generate thumbnails" not "Thumbnail generation"
3. **Emphasize simplicity** - "Title + Photo = Pro Thumbnail"
4. **Reference YouTube/platform context** - CTR, views, shorts, etc.
5. **Avoid generic filler** - every component should reinforce the value prop

## Notes

- The site uses `tw-animate-css` for additional animations
- All sections use `overflow-hidden` on parent containers
- Hover states use `group` pattern for coordinated child element effects
- The `scroll-mt-16` class on section anchors accounts for sticky header
