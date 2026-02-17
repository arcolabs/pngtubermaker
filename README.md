# Next.js Template

A production-ready starter template built with Next.js 16, React 19, and Tailwind CSS v4.

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

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
| Styling | Tailwind CSS v4 |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | better-auth |
| Storage | Cloudflare R2 (S3-compatible) |
| State | Zustand |
| Forms | react-hook-form + zod |
| Icons | lucide-react |
| Fonts | Geist |
| Linting | Biome |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── not-found.tsx      # 404 page
│   ├── api/               # API routes
│   └── login/             # Authentication pages
├── components/
│   ├── layout/            # Header, Footer
│   ├── auth/              # Auth components
│   ├── ui/                # Reusable UI components
│   └── sections/          # Page sections (Hero, Features, etc.)
├── lib/
│   ├── brand.ts           # Brand configuration
│   ├── db.ts              # Database connection
│   ├── auth.ts            # Auth configuration
│   ├── auth-client.ts     # Client-side auth
│   ├── utils.ts           # Utility functions
│   └── services/          # External services (R2, etc.)
├── database/
│   └── schema.ts          # Drizzle ORM schema
└── public/                # Static assets
```

## Available Scripts

```bash
bun run dev          # Start development server
bun run build       # Production build
bun run start       # Start production server
bun run check       # Run Biome linter
bun run format      # Format code with Biome
```

## Design System

### Colors (Dark Mode Only)

The template uses CSS variables defined in `app/globals.css`:

- `--primary` - Primary accent color (customizable via `NEXT_PUBLIC_PRIMARY_COLOR`)
- `--background` - Background (pure black)
- `--foreground` - Text color
- `--card` - Card backgrounds
- `--border` - Border color
- `--muted` - Muted backgrounds
- `--destructive` - Error/danger color

### Component Patterns

Use the `cn()` utility for conditional class merging:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  condition && "conditional-class",
)} />
```

### Glass-morphism Cards

```tsx
<div className="group relative rounded-2xl overflow-hidden
           border border-white/10 
           bg-white/5
           hover:bg-white/10
           hover:border-white/20
           transition-all duration-300" />
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for session encryption |
| `BETTER_AUTH_URL` | Auth base URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |
| `R2_ENDPOINT` | R2 API endpoint |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Custom domain for R2 |

## License

MIT
