# Architecture

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.3 (App Router), `output: "standalone"` |
| UI | React 19.2.3, Tailwind v4, DaisyUI v5, Geist font, lucide-react |
| DB | PostgreSQL (self-hosted; migrated off Neon 2026-08) + Drizzle ORM, driver `pg` via `drizzle-orm/node-postgres` |
| Auth | better-auth (Google/GitHub/Discord/Twitch OAuth) |
| Payment | Stripe (3-tier subscriptions) |
| Storage | Cloudflare R2 (S3-compatible) |
| i18n | next-intl, messages read from `process.cwd()/messages` at runtime |
| Lint/format | Biome 2.2 (config at repo root) |
| Package manager | Bun workspaces |

## Monorepo layout

```
/                       # workspace root: package.json (workspaces), bun.lock,
                        # biome.json, Dockerfile, docker-compose.yml, Caddyfile
apps/web/               # the only application — the Next.js full-stack app
docs/context/           # authoritative active project context (see its README)
docs/legacy/            # historical plans/tasks (not current truth)
.github/workflows/      # pr.yml (CI) + cron.yml (scheduled HTTP jobs)
```

## apps/web structure (current, authoritative)

```
app/
├── (player)/player/        # OBS player embed (excluded from i18n middleware)
├── [locale]/               # all localized pages
│   ├── (main)/             # landing, pricing, legal, create, dashboard, ...
│   ├── login/              # OAuth login
│   └── showcase/           # marketing showcase (route gitignored variants exist)
├── api/
│   ├── auth/[...all]/      # better-auth handler
│   ├── avatars/            # generation, expressions, packs, select, regenerate
│   ├── credits/            # balance, history
│   ├── cron/               # expire-credits, generation-health (Bearer CRON_SECRET)
│   ├── payments/           # subscribe, portal, topup
│   ├── webhooks/stripe/    # Stripe webhook
│   └── images/ partners/ subscription/ badges/ proxy-image/ admin/
├── layout.tsx  not-found.tsx  robots.ts  sitemap.ts  globals.css
components/                 # analytics auth avatars create dashboard i18n landing
                            # layout player pricing sections ui widget
hooks/                      # client state (zustand stores, upload, generation)
lib/
├── auth.ts auth-client.ts  # better-auth server config (4 OAuth providers)
├── brand.ts company.ts     # brand config
├── db.ts                   # Drizzle client (pg TCP driver — see invariants)
├── stripe.ts               # PRICING_CONFIG + Stripe helpers
├── pngtuber-engine.ts      # client-side mouth/blink engine
├── i18n/                   # routing + request config (fs-reads messages/)
├── landing-pages/          # programmatic landing pages
└── services/               # credits, credit-config, generation/, avatars,
                            # background-removal, r2, storage, lark, admin, ...
database/
├── schema.ts               # user, subscriptions, avatars, images, wallets, ...
└── migrations/             # Drizzle migrations
messages/<locale>/*.json    # namespaced i18n messages (runtime fs read)
scripts/                    # init-db.ts, i18n-translate.ts, test-*.ts, vps-setup.sh
middleware.ts               # next-intl middleware (excludes api/_next/player/static)
instrumentation.ts          # registers in-process daily credit-expiration cron
```

## Generation stack (2026-07-13)

Upstreams are called **directly** — the old self-hosted CocoRouter relay was
removed after taking generation down twice in eleven days.

| | primary | fallback |
|---|---|---|
| character (4 candidates) | 3× seedream-5.0-lite (**BytePlus**) + 1× qwen (**PiAPI**) | PiAPI seedream-5-lite → qwen fills empty slots |
| expression (image-edit) | seedream-5.0-lite (**BytePlus**) | PiAPI seedream-5-lite → PiAPI qwen |
| background removal | PiAPI image-toolkit | — |

- **BytePlus**: `POST {ARK_BASE_URL}/api/v3/images/generations`,
  `Authorization: Bearer ARK_API_KEY`, **synchronous — no polling**. `model`
  is an endpoint id (`ARK_SEEDREAM_LITE_ENDPOINT`). Adding `image` (URL or
  URL array) switches the same endpoint to image-edit.
- **PiAPI**: `POST /api/v1/task` + `GET /api/v1/task/{id}`, header
  **`X-API-Key`** (not Bearer).
- `avatars.candidate_providers` records the upstream per candidate;
  `avatars.metadata` records `{selectedProvider, selectedIndex}` on select.
  Keep provider labels distinguishable — that pair is the only signal for
  whether the model mix is right.

The hard-won rules (timeout wall, model choices, similarity gate, funded
accounts) are in `invariants.md` — they exist because of production incidents.
