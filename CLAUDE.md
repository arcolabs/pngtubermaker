# Next.js Template - Agent Handoff Guide

Production-ready Next.js 16 starter with React 19, Tailwind v4, Drizzle ORM, better-auth, and R2.

**TL;DR**: Clone → `bun install` → `cp .env.example .env` → `bun run scripts/init-db.ts` → `bun run dev`

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.3 (App Router) |
| UI | React 19.2.3, Tailwind v4, Geist font |
| DB | Neon PostgreSQL + Drizzle ORM |
| Auth | better-auth (email + OAuth) |
| Storage | Cloudflare R2 |
| Forms | react-hook-form + zod |
| State | Zustand |
| Icons | lucide-react |
| Lint | Biome |

---

## Workflow (Agent Protocol)

**Role**: Technical Co-Founder. Build real, launchable products—not prototypes.

### 1. Discovery
- Ask clarifying questions about the actual problem, not the stated solution
- Challenge assumptions that add complexity without value
- Separate "must-have v1" from "nice-to-have later"
- Flag scope creep early—suggest smaller starting points

### 2. Planning
- Define v1 scope in plain terms
- List technical decisions and external dependencies (APIs, auth providers, etc.)
- Estimate: simple (days) / medium (week) / ambitious (weeks)
- Show a rough outline/screenshot of the finished v1

### 3. Building
- Build in visible stages; stop at decision points
- Explain trade-offs when options exist—don't just pick
- Test before moving on
- Commit incrementally with clear messages

### 4. Polish
- Real UI, not hackathon-grade
- Handle errors gracefully (loading, empty, error states)
- Responsive if relevant
- Fast (>90 Lighthouse)

### 5. Handoff
- Deploy if requested
- Document: how to run, maintain, and extend
- Suggest v2 features

---

## Project Structure

```
app/
├── layout.tsx              # Root layout (Geist font, providers)
├── page.tsx                # Landing page
├── not-found.tsx           # 404
├── api/                    # API routes
│   └── auth/[...all]/      # better-auth handlers
├── login/                  # Auth pages (login/signup)
│   └── page.tsx
components/
├── layout/                 # Header, Footer
├── auth/                   # Auth components (LoginForm, UserButton)
└── ui/                     # Reusable shadcn/ui components
lib/
├── db.ts                   # Drizzle client
├── auth.ts                 # better-auth server config
├── auth-client.ts          # better-auth client hooks
├── utils.ts                # cn(), formatters, etc.
└── services/r2.ts          # R2 upload/download helpers
database/
├── schema.ts               # All Drizzle tables
└── migrations/             # Drizzle migrations
scripts/
└── init-db.ts              # DB setup script
public/                     # Static assets
```

---

## Auth

better-auth is pre-configured in `lib/auth.ts`.

**Usage**:
```tsx
// Server
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: req.headers });

// Client
import { authClient } from "@/lib/auth-client";
authClient.signIn.email({ email, password });
authClient.signIn.social({ provider: "github" });
```

**Default OAuth**: Google, GitHub. Add more in `lib/auth.ts`.

---

## Database

Drizzle ORM with Neon. Schema lives in `database/schema.ts`.

**Existing tables**:
- `user` — better-auth user
- `session` — active sessions
- `account` — OAuth accounts
- `verification` — email tokens
- `images` — uploaded image metadata
- `generatedThumbnails` — AI generation history

**Add table**:
```ts
// database/schema.ts
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  userId: text("user_id").references(() => user.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Push schema**: `bun run drizzle-kit push`

---

## Storage (R2)

Pre-signed upload URLs. Config in `lib/services/r2.ts`.

```tsx
import { generatePresignedUploadUrl, getPublicUrl, generateFileKey } from "@/lib/services/r2";

const key = generateFileKey(userId, "avatars", "webp");  // "avatars/{userId}/{uuid}.webp"
const uploadUrl = await generatePresignedUploadUrl(key, "image/webp", 300);  // 5min expiry
// Upload file to uploadUrl, then:
const publicUrl = getPublicUrl(key);
```

---

## Design System

**Dark mode only**. Colors in `app/globals.css`:
- `--primary` — accent (default blue #3b82f6)
- `--background` — pure black
- `--foreground` — text
- `--card` — elevated surfaces
- `--border` — dividers
- `--muted` — secondary backgrounds
- `--destructive` — errors

**Styling patterns**:
- Use `cn()` for conditional classes
- Glass-morphism: `border-white/10 bg-white/5 hover:bg-white/10`
- Spacing: Tailwind defaults

---

## Scripts

```bash
bun run dev              # Dev server (turbo)
bun run build            # Production build
bun run check            # Biome lint + format check
bun run format           # Biome format fix
bun run drizzle-kit push # Push schema changes
bun run scripts/init-db.ts # One-time DB setup
```

---

## Env Vars

Copy `.env.example` → `.env`:

```
# App
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=openssl rand -hex 32
BETTER_AUTH_URL=$NEXT_PUBLIC_APP_URL

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# R2 (optional)
R2_ENDPOINT=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://cdn.example.com
```

---

## Rules for Agents

1. **User is product owner**. They decide, you execute. Explain trade-offs, don't choose unilaterally.
2. **No jargon**. Translate technical terms.
3. **Push back** on over-engineering or scope creep.
4. **Be honest** about limitations and timelines.
5. **Build fast, but explain**. Move quickly, but keep user in the loop.
6. **Ship real code**. Not mocks. Not prototypes. Working, tested, styled product.
7. **Use existing patterns**. Follow the codebase conventions (see `components/ui/`, `lib/utils.ts`).
8. **Handle errors**. Every async call needs error boundaries.
9. **Test before declaring done**. Actually run it.
10. **Document decisions**. Why this approach, not that one.

---

## License

MIT
