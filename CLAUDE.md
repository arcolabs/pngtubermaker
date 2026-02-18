# PNGTuberMaker - Agent Handoff Guide

AI-powered PNGTuber avatar generator for streamers. Production-ready Next.js 16 with React 19, Tailwind v4, DaisyUI v5, Drizzle ORM, better-auth, Stripe, and R2.

**TL;DR**: `bun install` → `cp .env.example .env` → `bun run scripts/init-db.ts` → `bun run dev`

---

## Business Context

**PNGTuberMaker** helps Twitch/YouTube/Discord streamers create professional PNG avatars:
- AI avatar generation from text/image prompts
- Expression packs (happy/angry/sad/surprised)
- Animation generation (blinking, mouth movement)
- HD/4K upscale and variations

**Target Users**: Streamers, VTubers, content creators who want custom avatars without hiring artists.

**Value Prop**: Create avatars in minutes, not weeks. Save hundreds vs traditional commissions.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.3 (App Router) |
| UI | React 19.2.3, Tailwind v4, DaisyUI v5, Geist font |
| DB | Neon PostgreSQL + Drizzle ORM |
| Auth | better-auth (Google/GitHub/Discord/Twitch OAuth) |
| Payment | Stripe (3-tier subscriptions: Free/Start/Pro) |
| Storage | Cloudflare R2 |
| Forms | react-hook-form + zod |
| Icons | lucide-react |
| Lint | Biome |

---

## Pricing Tiers

| Tier | Price | Generations | Features |
|------|-------|-------------|----------|
| **Free** | $0 | 3/month | Watermarked, low-res export, community support |
| **Start** | $9/mo | 50/month | HD export (1080p), no watermark, basic expressions, email support |
| **Pro** | $30/mo | Unlimited | 4K export, all expressions & animations, commercial license, priority queue, avatar library |

Yearly billing saves 20%.

---

## Project Structure

```
app/
├── (main)/
│   ├── layout.tsx             # Main layout (Header + Footer + DotMatrixBrand)
│   ├── page.tsx               # Landing page (Hero → CharacterShowcase → AITools → Comparison → Pricing → Testimonials → FAQ → DiscordCTA)
│   ├── pricing/page.tsx       # Pricing page with success/cancel handling
│   └── legal/                 # Terms & Privacy pages
├── login/
│   └── page.tsx               # OAuth login (Google/GitHub/Discord/Twitch)
└── api/
    ├── auth/[...all]/         # better-auth handlers
    ├── payments/
    │   ├── subscribe/route.ts # Create Stripe checkout
    │   └── topup/route.ts     # Wallet top-up (future)
    └── webhooks/stripe/       # Stripe webhook handler

components/
├── layout/
│   ├── Header.tsx             # Navigation with auth buttons
│   └── Footer.tsx             # Links + Discord + Email
├── sections/                  # Landing page sections
│   ├── Hero.tsx               # Main hero with video showcase
│   ├── CharacterShowcase.tsx  # Avatar gallery + generation input
│   ├── AITools.tsx           # 4 AI features with sticky tabs
│   ├── Comparison.tsx        # vs Traditional commission
│   ├── Testimonials.tsx      # User reviews
│   ├── FAQ.tsx               # Frequently asked questions
│   └── DiscordCTA.tsx        # Discord community CTA
├── pricing/
│   ├── PricingSection.tsx    # 3-tier pricing display
│   ├── PricingCard.tsx       # Individual tier card (supports Free $0)
│   └── PricingToggle.tsx     # Monthly/yearly switch
└── ui/                        # Reusable components (UserCountBadge, DotMatrixBrand, etc.)

lib/
├── brand.ts                   # Brand config (PNGTuberMaker)
├── stripe.ts                  # PRICING_CONFIG + Stripe helpers
├── auth.ts                    # better-auth server config (4 OAuth providers)
├── auth-client.ts             # Client auth hooks
├── db.ts                      # Drizzle client
├── utils.ts                   # cn(), formatters, etc.
└── services/
    └── r2.ts                  # Cloudflare R2 upload helpers

database/
├── schema.ts                  # Drizzle tables (user, subscriptions, generatedAvatars, images, etc.)
└── migrations/                # Drizzle migrations

public/
├── images/
│   ├── showcase/              # Avatar examples (1.WEBP - 8.WEBP)
│   ├── AITools/               # Feature screenshots
│   └── comparison_*.jpg       # Comparison section images
└── videos/                    # Demo videos (Thumbfree.mp4)
```

---

## Key Business Logic

### Pricing Configuration (`lib/stripe.ts`)

```typescript
export const PRICING_CONFIG = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "3 avatar generations/month",
      "Basic avatar generation", 
      "Low resolution export",
      "PNGTuber watermark",
      "Community support",
    ],
  },
  start: {
    name: "Start",
    monthlyPrice: 9,
    yearlyPrice: 86.4,
    features: [
      "50 avatar generations/month",
      "HD export (1080p)",
      "No watermark",
      "Basic expressions pack",
      "Standard generation queue",
      "Email support",
    ],
  },
  pro: {
    name: "Pro", 
    monthlyPrice: 30,
    yearlyPrice: 288,
    features: [
      "Unlimited avatar generations",
      "4K HD export",
      "No watermark",
      "All expressions & animations",
      "Priority generation queue",
      "Full commercial license",
      "Access to avatar library",
      "Priority email support",
    ],
  },
};
```

### Database Schema (`database/schema.ts`)

Key tables for the business:
- `user` — User accounts with stripeCustomerId
- `subscriptions` — Active subscriptions (tier: 'free' | 'start' | 'pro')
- `generatedAvatars` — AI generation history (avatar, expression, animation)
- `images` — Stored image metadata (avatars, uploads)
- `wallets` — Credit balance (for future pay-per-generation model)

### Auth (`lib/auth.ts`)

Configured OAuth providers (all relevant to streamers):
- **Google** — General users
- **GitHub** — Developer creators  
- **Discord** — Community-focused streamers
- **Twitch** — Primary streaming platform

---

## Workflow (Agent Protocol)

### 1. Discovery
- Understand the feature's purpose for streamers/creators
- Consider pricing tier: Free demo feature? Start tier? Pro only?
- Challenge scope creep — suggest core avatar features first

### 2. Planning
- Define which pricing tier this belongs to
- Consider auth requirements (generation requires login)
- Plan UI: new section? integrate into existing flow?
- Identify external APIs needed (AI generation, image processing)

### 3. Building
- Follow existing patterns in `components/sections/`
- Use DaisyUI classes: `bg-base-100`, `text-primary`, `btn-primary`
- Handle all states: loading, error, empty, success
- Test pricing display with Free/Start/Pro

### 4. Polish
- Mobile-first responsive design
- Light theme consistency (not dark mode)
- Update SEO metadata if new pages
- Add to sitemap if new routes

### 5. Handoff
- Run `bun run check` to verify
- Document new env vars
- Update pricing features if applicable
- Test the full user flow

---

## Design System

**Theme**: Light theme with cyan primary (`#06b6d4`)

**DaisyUI Classes**:
- `bg-base-100` — Main background (white/light gray)
- `bg-base-200` — Elevated surfaces (cards)
- `text-primary` — Brand cyan color
- `btn-primary` — Primary actions (cyan bg)
- `btn-outline` — Secondary actions

**Custom Patterns**:

```tsx
// Glass card effect
<div className="border border-white/10 bg-white/5 backdrop-blur-xl" />

// Primary gradient background
<div className="bg-gradient-to-br from-primary/10 to-base-200" />

// Cyan glow shadow
<div className="shadow-[0_4px_30px_rgba(6,182,212,0.25)]" />

// Hover state
<div className="hover:shadow-[0_8px_40px_rgba(6,182,212,0.35)] transition-all" />
```

---

## Available Scripts

```bash
bun run dev                  # Dev server on :3000
bun run build                # Production build
bun run check                # Biome lint + format check
bun run format               # Biome format fix
bun run db:push              # Push schema changes to Neon
bun run db:generate          # Generate migration files
bun run db:migrate           # Run migrations
bun run scripts/init-db.ts   # One-time DB setup
```

---

## Environment Variables

### Required
```bash
NEXT_PUBLIC_APP_NAME=PNGTuberMaker
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CONTACT_EMAIL=support@pngtubermaker.com
NEXT_PUBLIC_SOCIAL_DISCORD=https://discord.gg/zysPAnvP8f

DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3000
```

### OAuth (for streamer-friendly login)
```bash
# All 4 providers enabled
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
```

### Stripe (for 3-tier subscriptions)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_START_MONTHLY=price_...
STRIPE_PRICE_START_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

### R2 Storage (for avatar storage)
```bash
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

---

## Important Business Rules

1. **Pricing Tiers**: Always consider tier allocation. Free = teaser, Start = hobbyists, Pro = serious creators.

2. **Auth Required**: Avatar generation features require login. Check `authClient.getSession()` before API calls.

3. **Discord Community**: Official server is `https://discord.gg/zysPAnvP8f`. Linked in Footer, FAQ, and DiscordCTA.

4. **Domain**: Production is `pngtubermaker.com`. Local dev uses `localhost:3000`.

5. **Brand Voice**: 
   - "Create in minutes, not weeks"
   - "Save hundreds vs commissions"
   - Target: streamers, VTubers, content creators

6. **Image Storage**: All uploads to R2. Use `generateFileKey()` and `generatePresignedUploadUrl()`.

7. **Generation Limits**: Enforce tier limits in API layer (3/month Free, 50/month Start, unlimited Pro).

---

## Rules for Agents

1. **User is product owner**. They decide, you execute. Explain trade-offs.
2. **No jargon**. Translate technical terms for non-technical stakeholders.
3. **Push back** on over-engineering. Suggest simpler solutions first.
4. **Be honest** about limitations and timelines.
5. **Build fast, but explain**. Keep user in the loop at decision points.
6. **Ship real code**. Not mocks. Working, tested, styled product.
7. **Use existing patterns**. Follow conventions in `components/ui/` and `lib/utils.ts`.
8. **Handle errors**. Every async call needs loading/error states.
9. **Test before declaring done**. Actually run `bun run dev` and click through.
10. **Document decisions**. Why this approach, not alternatives.

---

## License

MIT
