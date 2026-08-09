# PNGTuberMaker

AI-powered PNGTuber avatar generator for streamers. Create professional
streaming avatars, expressions, and animations in minutes — not weeks.

This repository is a **Bun workspaces monorepo**. The product is a single
Next.js full-stack application in [`apps/web`](apps/web). Authoritative
project context lives in [`docs/context`](docs/context) — read it before
changing anything. `AGENTS.md` holds the monorepo-wide agent rules.

## 🚀 Quick Start

```bash
# Install dependencies (workspace root)
bun install

# Configure environment
cp apps/web/.env.example apps/web/.env   # then fill in values

# Initialize database
bun run init-db

# Start development server
bun run dev
```

Open [http://localhost:4000](http://localhost:4000) to view the app.

## 📁 Repository Layout

```
apps/web/        # Next.js 16 app (App Router, standalone output)
docs/context/    # authoritative product / architecture / operations / invariants
docs/legacy/     # historical plans & task lists (not current truth)
.github/         # CI (pr.yml) and scheduled HTTP jobs (cron.yml)
Dockerfile       # production image — Zeabur builds it from the repo root
docker-compose.yml, Caddyfile   # self-hosted fallback path
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, DaisyUI v5 |
| Database | PostgreSQL (self-hosted) + Drizzle ORM (`pg` driver) |
| Auth | better-auth (Google, GitHub, Discord, Twitch OAuth) |
| Payment | Stripe (subscriptions: Free / Start / Pro) |
| Storage | Cloudflare R2 |
| Package manager | Bun workspaces |

## 📝 Root Commands

```bash
bun install --frozen-lockfile   # reproducible workspace install
bun run dev                     # dev server (apps/web, :4000)
bun run check                   # Biome lint + format check
bun run build                   # production build
bun run start                   # production server
bun run db:push                 # push schema changes
bun run db:generate             # generate migrations
bun run db:migrate              # run migrations
bun run init-db                 # one-time DB setup
```

## ⚙️ Environment Variables

Copy `apps/web/.env.example` → `apps/web/.env` and fill in values. The full
variable list, the `CRON_SECRET` arrangement for scheduled jobs, and the
deployment contract (Zeabur root Dockerfile, port 3000, health check) are
documented in [`docs/context/operations.md`](docs/context/operations.md).
Never commit env values.

## 🐳 Production Build

```bash
docker build .
```

The root Dockerfile preserves the existing deployment contract: multi-stage
Bun build → Next.js standalone server on port 3000 with a `/` health check.

## 🤝 Contributing

Join our community on [Discord](https://discord.gg/zysPAnvP8f). Engineering
context and invariants: [`docs/context`](docs/context).

## 📄 License

MIT
