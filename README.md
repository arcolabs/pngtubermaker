# PNGTuberMaker

AI-powered PNGTuber avatar generator for streamers. Create professional streaming avatars, expressions, and animations in minutes — not weeks.

## 🚀 Quick Start

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

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎨 What is PNGTuberMaker?

PNGTuberMaker helps streamers create custom PNG avatars for platforms like Twitch, YouTube, and Discord:

- **AI Avatar Generation** — Turn text descriptions into unique characters
- **Expression Packs** — Auto-generate happy, angry, sad, surprised expressions
- **Animation Tools** — Add blinking, mouth movements, and transitions
- **Smart Upscale** — Polish avatars to HD/4K quality

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 generations/month, watermarked, low-res |
| **Start** | $9/mo | 50 generations/month, HD export, no watermark |
| **Pro** | $30/mo | Unlimited, 4K export, all features, commercial license |

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, DaisyUI v5 |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | better-auth (Google, GitHub, Discord, Twitch OAuth) |
| Payment | Stripe (subscriptions) |
| Storage | Cloudflare R2 |

## 📁 Project Structure

```
app/
├── (main)/                 # Main route group
│   ├── page.tsx           # Landing page with Hero, Features, Pricing
│   ├── pricing/           # Pricing page
│   └── legal/             # Terms & Privacy
├── login/                 # Auth page
├── api/                   # API routes
│   ├── auth/             # better-auth handlers
│   ├── payments/         # Stripe checkout
│   └── webhooks/         # Stripe webhooks
components/
├── sections/             # Page sections
│   ├── Hero.tsx
│   ├── CharacterShowcase.tsx
│   ├── AITools.tsx
│   ├── Comparison.tsx
│   ├── PricingSection.tsx
│   ├── Testimonials.tsx
│   └── FAQ.tsx
├── pricing/              # Pricing components
├── layout/               # Header, Footer
└── ui/                   # Reusable UI
lib/
├── brand.ts              # Brand config
├── stripe.ts             # Pricing & Stripe helpers
├── auth.ts               # Auth config
└── services/
    └── r2.ts             # Cloudflare R2 upload
database/
├── schema.ts             # Drizzle schema
└── migrations/           # DB migrations
```

## ⚙️ Environment Variables

Copy `.env.example` → `.env` and fill in:

```bash
# Required
NEXT_PUBLIC_APP_NAME=PNGTuberMaker
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3000

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_START_MONTHLY=price_...
STRIPE_PRICE_START_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# R2 Storage (optional)
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...
```

## 📝 Available Scripts

```bash
bun run dev               # Development server
bun run build             # Production build
bun run check             # Biome lint check
bun run format            # Format code
bun run db:push           # Push schema changes
bun run db:generate       # Generate migrations
bun run db:migrate        # Run migrations
```

## 🎭 Features

### Authentication
- Email/password login
- OAuth: Google, GitHub, Discord, Twitch
- Session management with better-auth

### Avatar Generation
- Text-to-avatar AI generation
- Reference image upload
- Transparent PNG output
- Expression pack generation
- Animation creation (MP4/GIF/WebM)

### Payments
- 3-tier subscription (Free/Start/Pro)
- Stripe checkout integration
- Customer portal for management
- Webhook handling for subscription events

## 🤝 Contributing

Join our community on [Discord](https://discord.gg/zysPAnvP8f)

## 📄 License

MIT
