# Operations & Deployment

## Deployment contract (Zeabur)

Production deploys from the **repository root**: Zeabur detects and builds the
root `Dockerfile` with the repo root as build context. That contract is
preserved deliberately — do not move the Dockerfile into `apps/web/` or
require a service-root change.

- Multi-stage: `oven/bun:1` deps (`bun install --frozen-lockfile` at the
  workspace root) → builder (`bun run --cwd apps/web build`) →
  `node:22-slim` runner.
- Next.js `output: "standalone"` in a workspace nests the server at
  `apps/web/server.js` inside `.next/standalone`; `server.js` does
  `process.chdir(__dirname)`, so `static/`, `public/`, and `messages/` are
  copied beside it (`messages` is read from `process.cwd()` at runtime).
- **Port 3000** (`PORT=3000`, `HOSTNAME=0.0.0.0`), `TZ=UTC` (DB timestamps are
  naive local time; pre-2026-06-10 rows are UTC-8), non-root user `nextjs`.
- Health check: `curl -f http://localhost:3000/` every 30s.
- Release readback: `GET` or `HEAD /api/release` returns the exact deployed
  source commit in `x-release-commit` with `Cache-Control: no-store`. The value
  is frozen at build time from Zeabur's `ZEABUR_GIT_COMMIT_SHA` (or
  `GITHUB_SHA` in CI); an absent or malformed commit returns 503 without the
  header. This endpoint is the production/rollback proof for controlled Git
  releases and must never fall back to a branch name or a runtime timestamp.
- `docker-compose.yml` + `Caddyfile` at root mirror the same build
  (`reverse_proxy app:3000`) for the self-hosted fallback path; run it with
  `docker compose --env-file apps/web/.env up -d`.
- Build-time `NEXT_PUBLIC_*` values are passed as Docker build args; a dummy
  `DATABASE_URL` is set for build-time page collection only.

## Environment variables

Defined in the deployment platform (Zeabur) and locally in
`apps/web/.env` (gitignored). **Never commit values.**

Required: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_SOCIAL_DISCORD`, `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

OAuth: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`,
`DISCORD_CLIENT_ID/SECRET`, `TWITCH_CLIENT_ID/SECRET`.

Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_{START,PRO}_{MONTHLY,YEARLY}`.

Generation upstreams: `GENERATION_ADAPTER` (`mock` for local dev,
`production` otherwise), `ARK_BASE_URL`, `ARK_API_KEY`,
`ARK_SEEDREAM_LITE_ENDPOINT` (BytePlus); `PIAPI_BASE_URL` (default
`https://api.piapi.ai`), `PIAPI_KEY` (PiAPI). Alerting: `LARK_WEBHOOK_URL`.

R2: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`, `R2_PUBLIC_URL`.

`DATABASE_URL` note: self-hosted PG uses a self-signed cert, so the URL needs
`sslmode=require&uselibpqcompat=true` (pg v8.22+ treats bare `require` as
verify-full).

## CRON_SECRET and scheduled jobs

`CRON_SECRET` is a shared bearer token stored as a **GitHub Actions secret**
and as an app env var. It is documented here by name only — never read,
print, or commit its value. Rotating it means updating both sides.

Two cron mechanisms exist and both must keep working:

1. **GitHub Actions** (`.github/workflows/cron.yml`) — designed to run on
   GitHub's infrastructure on purpose: an alarm that shares a failure domain with
   the thing it watches is not an alarm. GitHub holds only `CRON_SECRET`; the jobs
   are plain authenticated HTTPS calls, so no database credential leaves our
   infrastructure.
   - Every 6h: `POST /api/cron/generation-health` — if the generation failure
     rate over the last 6h exceeds 50% (min 10 attempts), the endpoint sends a
     Lark alert and returns 503, which also fails the Actions job (GitHub
     emails on top).
   - Daily 03:17 UTC: `POST /api/cron/expire-credits`.

   **⚠️ Measured reality (2026-09-24), which contradicts the schedule above:**
   `cron.yml` is `state=disabled_manually` and has `total_runs=0` — it has
   **never executed**, not merely stopped since some date. Someone disabled it
   deliberately, and this is Chesterton's Fence: **do not re-enable it without
   first finding out why** (it may have been turned off for a reason — cost,
   noise, a superseded alarm path — that is not recorded here). The consequence
   to weigh before touching it: `generation-health` has **no other caller**. A
   repo-wide grep for it matches only the route file and generated type files;
   the in-process fallback below covers `expire-credits` only, not
   `generation-health`. So as measured, the generation-failure alarm described in
   "Monitoring philosophy" has never fired on a schedule. (The `CRON_SECRET`
   presence is **not** established either way here: the Actions secrets API
   returned `total_count=0` for this repo *and* for arcops-server, which is known
   to hold secrets, so the read is uninformative rather than proof of absence.)
   The fix, if one is wanted, is to re-enable the workflow on GitHub-hosted
   runners — **not** to move it to the self-hosted `arcops` runner the way
   `pr.yml` had to be, because self-hosting would put the alarm in the same
   failure domain as production and defeat the entire reason it exists. That
   choice, and the reason for the disable, are Kai's.
2. **In-process** (`apps/web/instrumentation.ts`, node-cron, daily 01:00):
   expires subscription credits past their date. Credit expiration is
   housekeeping — `getBalance` and the spend path already treat an expired
   subscription balance as zero, so a missed run costs nothing.

## Monitoring philosophy

Watch the success rate, not the container. Generation once failed ~100% for
four days (2026-07-08→12) and the first signal was a customer email — the
`avatars` table knew the whole time. A green container says nothing; ask the
data.

## Upstream accounts must stay funded

**A drained upstream balance does not fail fast — it hangs.** On 2026-07-13
the ARK account ran out of credit and BytePlus held each request until our
85s timeout fired; `candidate_providers` came back `qwen,qwen,qwen,qwen` and
attempts `failed` at 84–106s. The key probed fine from a laptop — check the
*balance*, not the endpoint. Keep both **BytePlus/ARK** and **PiAPI** funded.

PiAPI is a queue, not a tunable bottleneck: measured queue wait 78–122s vs
0.3–33s actual generation (hobbyist plan, 3 concurrent tasks). When PiAPI's
queue is hot, the fallback cannot save us inside the 100s wall.

## R2 lifecycle

Configure in the Cloudflare dashboard (not in code): auto-delete objects under
`avatars/*/candidates/` after 7 days (safety net; selected-flow cleanup
already deletes unselected candidates).
