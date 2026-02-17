# Next.js Template

A production-ready starter template built with Next.js 16, React 19, and Tailwind CSS v4.

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

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for authentication
- `R2_*` - Cloudflare R2 storage credentials (optional)

### 3. Initialize database

Run the database migrations/schema:

```bash
bun run scripts/init-db.ts
```

### 4. Start development server

```bash
bun run dev
```

Visit http://localhost:3000

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── not-found.tsx       # 404 page
│   ├── api/                # API routes
│   └── login/              # Authentication pages
├── components/
│   ├── layout/              # Header, Footer
│   ├── auth/                # Auth components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── db.ts                # Database connection
│   ├── auth.ts              # Auth configuration
│   ├── auth-client.ts       # Client-side auth
│   ├── utils.ts             # Utility functions
│   └── services/            # External services (R2, etc.)
├── database/
│   └── schema.ts            # Drizzle ORM schema
└── public/                  # Static assets
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

The template uses CSS variables that can be customized in `app/globals.css`:

- `--primary` - Primary accent color (default: blue #3b82f6)
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
| `NEXT_PUBLIC_APP_NAME` | App name (displayed in header) |
| `NEXT_PUBLIC_APP_URL` | Public URL for OAuth callbacks |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret for session encryption |
| `BETTER_AUTH_URL` | Auth base URL (defaults to APP_URL) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret |
| `R2_ENDPOINT` | R2 API endpoint |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Custom domain for R2 (optional) |

## Authentication

The template includes complete authentication with better-auth:

- Email/password sign up/in
- OAuth (Google, GitHub)
- Session management
- Protected routes

Check `app/login/` for login pages and `components/auth/` for auth components.

## Database

Drizzle ORM is configured with the following tables:

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens
- `images` - Image storage records
- `generatedThumbnails` - AI generation history

Add your own tables in `database/schema.ts`.

## Storage

R2 service is configured for file storage. Usage:

```tsx
import { generatePresignedUploadUrl, getPublicUrl, generateFileKey } from "@/lib/services/r2";

const key = generateFileKey(userId, "uploads", "webp");
const uploadUrl = await generatePresignedUploadUrl(key, "image/webp");
const publicUrl = getPublicUrl(key);
```

## License

MIT
