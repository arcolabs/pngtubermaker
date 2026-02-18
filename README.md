# Next.js Template

A production-ready starter template built with Next.js 16, React 19, Tailwind CSS v4, and DaisyUI v5.

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Initialize database
bun run scripts/init-db.ts

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the template.

## Brand Configuration

This template supports easy branding customization. All brand-related settings are centralized in `lib/brand.ts` and can be configured via environment variables.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Brand name | "NextJS Template" |
| `NEXT_PUBLIC_APP_SHORT_NAME` | Short name | "Template" |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Site description | - |
| `NEXT_PUBLIC_APP_URL` | Public URL | "http://localhost:3000" |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email | "support@example.com" |
| `NEXT_PUBLIC_SOCIAL_TWITTER` | Twitter handle | - |
| `NEXT_PUBLIC_SOCIAL_GITHUB` | GitHub URL | - |
| `NEXT_PUBLIC_SOCIAL_DISCORD` | Discord invite URL | - |
| `NEXT_PUBLIC_PRIMARY_COLOR` | Primary theme color | "#3b82f6" |
| `NEXT_PUBLIC_FEATURE_AUTH` | Enable auth feature | true |
| `NEXT_PUBLIC_FEATURE_STORAGE` | Enable storage feature | true |

### Configuration File

For more advanced customization, edit `lib/brand.ts`:

```typescript
export const brand = {
  name: "Your Brand Name",
  shortName: "Brand",
  description: "Your site description",
  
  contact: {
    email: "support@yourbrand.com",
    website: "https://yourbrand.com",
  },
  
  social: {
    twitter: "@yourhandle",
    github: "https://github.com/yourorg",
    discord: "https://discord.gg/yourinvite",
  },
  
  logo: {
    svgPath: "/logo.svg",
    alt: "Your Logo",
  },
  
  ascii: {
    enabled: true,
    text: "YOURBRAND",
  },
  
  features: {
    auth: true,
    storage: true,
  },
  
  theme: {
    primaryColor: "#3b82f6",
  },
};
```

### Logo

Replace `public/logo.svg` with your own logo. The template expects a square SVG file.

### ASCII Brand Text

The large ASCII brand text at the bottom of pages is controlled by `brand.ascii.text`. It automatically extracts uppercase letters from `APP_NAME` by default.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.3 (App Router) |
| React | 19.2.3 |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | better-auth |
| Payment | Stripe (subscriptions + wallet top-up) |
| Storage | Cloudflare R2 (S3-compatible) |
| State | Zustand |
| Forms | react-hook-form + zod |
| Images | sharp |
| Icons | lucide-react |
| Fonts | Geist |
| Linting | Biome |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── not-found.tsx       # 404 page
│   ├── globals.css         # Global styles (Tailwind + DaisyUI)
│   ├── sitemap.ts          # Sitemap generation
│   ├── robots.ts           # Robots.txt generation
│   ├── (main)/             # Main route group
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Home page
│   │   ├── pricing/        # Pricing page
│   │   └── legal/          # Legal pages (privacy, terms)
│   ├── login/              # Authentication pages
│   └── api/
│       ├── auth/[...all]/  # better-auth handlers
│       ├── payments/       # Payment endpoints
│       └── webhooks/       # Stripe webhook handler
├── components/
│   ├── layout/             # Header, Footer
│   ├── auth/               # Auth components
│   ├── ui/                 # Reusable UI components
│   ├── pricing/            # Pricing components
│   └── sections/           # Page sections (Hero, Features, etc.)
├── hooks/
│   └── use-stripe.ts       # Stripe subscription & top-up hooks
├── lib/
│   ├── brand.ts            # Brand configuration
│   ├── db.ts               # Database connection
│   ├── auth.ts             # Auth configuration
│   ├── auth-client.ts      # Client-side auth
│   ├── stripe.ts           # Stripe client & helpers
│   ├── utils.ts            # Utility functions
│   └── services/           # External services (R2, etc.)
├── database/
│   ├── schema.ts           # Drizzle ORM schema
│   └── migrations/         # Drizzle migrations
├── scripts/
│   ├── init-db.ts          # DB setup script
│   └── test-upload.ts      # R2 upload test
└── public/                 # Static assets
```

## Available Scripts

```bash
bun run dev               # Start development server
bun run build             # Production build
bun run start             # Start production server
bun run check             # Run Biome linter
bun run format            # Format code with Biome
bun run db:push           # Push schema changes to database
bun run db:generate       # Generate migration files
bun run db:migrate        # Run database migrations
bun run scripts/init-db.ts # Initialize database tables
```

## Design System

### DaisyUI Theme (Dark Mode Only)

This template uses DaisyUI v5 with the "black" theme. The design system is built on DaisyUI's semantic class names:

**Background & Surfaces:**
- `bg-base-100` — Main background
- `bg-base-200` — Elevated surfaces (cards, modals)
- `bg-base-300` — Borders and dividers

**Text:**
- `text-base-content` — Primary text
- `text-primary` — Accent/brand text

**Buttons:**
- `btn-primary` — Primary action button
- `btn-secondary` — Secondary action
- `btn-ghost` — Subtle button
- `btn-outline` — Outlined button

**Components:**
- `card` — Card container
- `badge` — Status badges
- `input` — Form inputs
- `select` — Dropdown selects
- `textarea` — Text areas

**Custom Utilities:**

Use the `cn()` utility for conditional class merging:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  condition && "conditional-class",
)} />
```

**Glass-morphism Cards:**

```tsx
<div className="group relative rounded-2xl overflow-hidden
           border border-white/10 
           bg-white/5
           hover:bg-white/10
           hover:border-white/20
           transition-all duration-300" />
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for session encryption (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | Auth base URL |

### OAuth (Optional)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |

### R2 Storage (Optional)

| Variable | Description |
|----------|-------------|
| `R2_ENDPOINT` | R2 API endpoint |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Custom domain for R2 |

### Stripe Payments (Optional)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (whsec_...) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |
| `STRIPE_PRICE_BASIC_MONTHLY` | Price ID for Basic monthly plan |
| `STRIPE_PRICE_BASIC_YEARLY` | Price ID for Basic yearly plan |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID for Pro monthly plan |
| `STRIPE_PRICE_PRO_YEARLY` | Price ID for Pro yearly plan |

## Database Schema

The template includes the following tables:

- **user** — User accounts (better-auth)
- **session** — Active sessions
- **account** — OAuth account connections
- **verification** — Email verification tokens
- **images** — Uploaded file metadata
- **wallets** — User wallet balances for top-ups
- **transactions** — Payment and top-up history
- **subscriptions** — Stripe subscription status
- **webhookEvents** — Stripe webhook idempotency tracking
- **generatedThumbnails** — AI generation history

## Features

### Authentication
- Email/password login
- OAuth (Google, GitHub)
- Session management with better-auth

### Payments
- Subscription management with Stripe
- Wallet top-up system
- Customer portal integration
- Webhook handling for events

### Storage
- Cloudflare R2 integration
- Pre-signed upload URLs
- Image optimization with sharp

## License

MIT
