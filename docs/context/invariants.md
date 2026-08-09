# Active Engineering Invariants

Each invariant here exists because violating it caused (or nearly caused) a
production incident. Change them only with a deliberate, documented decision.

## Database

1. **The DB driver stays a plain TCP driver** — `pg` via
   `drizzle-orm/node-postgres` in `apps/web/lib/db.ts`.
   `@neondatabase/serverless` speaks WebSocket to Neon endpoints only; it
   fails against plain PostgreSQL and took down Google login for ~1h on
   2026-08-02 during the first migration attempt.
2. **Self-signed PG cert**: `DATABASE_URL` needs
   `sslmode=require&uselibpqcompat=true` (pg v8.22+ treats bare `require` as
   verify-full).
3. **`apps/web/lib/services/credit-config.ts` (`TASK_COSTS`/`TIER_CREDITS`)
   must stay DB-free.** Client components import it; importing `credits.ts`
   from a client component pulls `pg` into the browser bundle and breaks the
   build.

## Generation

4. **Everything must finish inside Cloudflare's 100s origin wall.** Generation
   is fully synchronous (`await adapter.generateCharacter()` in the request);
   upstream calls are capped at 85s. Measured: lite txt2img ~20–28s, lite
   image-edit ~30s, qwen ~40–56s.
5. **seedream-5.0-pro is unusable for txt2img here**: 108–147s on BytePlus
   *and* PiAPI, at 1K *and* 2K. (Its image-edit is fast, ~30s.)
6. **gpt-image-2 is dropped**: $0.195/image (3.75× lite), routinely blew the
   wall, and abandoned sync calls are still billed upstream.
7. **Lite exposes no `seed`.** The three character candidates carry distinct
   prompt variants; identical prompts collapse candidates toward one look
   (measured dHash distance 10, under the 14 threshold `similarity.ts` calls
   "the same image").
8. **The similarity gate (`gateExpression`/`resemblesBase`) must wrap every
   expression attempt.** An upstream can return HTTP 200 with an unrelated
   image (silently degrading image-edit to text-to-image); the gate turns that
   into a normal failure so the fallback chain advances.
9. **Keep provider labels distinguishable** in `candidate_providers` /
   `metadata.selectedProvider` — that pair is the only signal for evaluating
   the model mix.
10. **Both upstream accounts (BytePlus/ARK and PiAPI) stay funded** — a
    drained balance hangs instead of failing (see `operations.md`).

## Product & platform

11. **No watermark on any tier** — differentiation is export resolution and
    feature access only.
12. **Generation limits enforced in the API layer**: 3/month Free, 50/month
    Start, unlimited Pro.
13. **Auth required** for all generation endpoints.
14. **Scheduled jobs stay outside the app's failure domain**: the GitHub
    Actions cron (`.github/workflows/cron.yml`) calls authenticated HTTP
    endpoints with `CRON_SECRET`; no database credential may be added to
    GitHub.
15. **Deployment builds from the repository root** (Zeabur): the root
    Dockerfile, port 3000, and the `/` health check are the contract — do not
    break them when changing the repo layout.
16. **Light theme, cyan primary** (`#06b6d4`), DaisyUI v5 semantics
    (`bg-base-100`, `btn-primary`, ...). Mobile-first responsive.

## Repository hygiene

17. **No credentials, local agent settings, or cache artifacts in git.**
    `.claude/`, `.firecrawl/`, `.codex`, `__pycache__/`, `*.pyc`, and `.env*`
    are gitignored. (The pre-monorepo history once committed a local agent
    settings file containing infrastructure passwords — those credentials must
    be treated as compromised and rotated by the operator.)
18. **No active instruction may depend on a personal absolute path.**
19. **Run `bun run check` before declaring done**; `bun install
    --frozen-lockfile`, `bun run check`, and `bun run build` must pass from
    the repository root.
