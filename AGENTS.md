# PNGTuberMaker — Agent Guide (Monorepo)

AI-powered PNGTuber avatar generator for streamers. This repository is the
self-contained product monorepo: one application (`apps/web`), one workspace
root, one authoritative context directory.

**TL;DR**: `bun install` → add env vars (see `docs/context/operations.md`) →
`bun run init-db` → `bun run dev`

## Layout

```
apps/web/        # the Next.js 16 full-stack application (the only app)
docs/context/    # AUTHORITATIVE active project context — read first
docs/legacy/     # historical plans/tasks, not current truth
.github/         # pr.yml (CI) + cron.yml (scheduled HTTP jobs)
Dockerfile       # production image; Zeabur builds it from the repo root
```

## Authoritative context

**Read `docs/context/` before changing anything.** It owns product
(`product.md`), architecture (`architecture.md`), operations/deployment
(`operations.md`), and the active engineering invariants (`invariants.md`).
Context ownership rules are in `docs/context/README.md`; the short version:
active truth lives in `docs/context/`, `docs/legacy/` is archaeology, and
context updates land in the same PR as the change.

`CLAUDE.md` is a symlink to this file.

## Root commands

```bash
bun install --frozen-lockfile   # workspace install (must stay reproducible)
bun run dev                     # dev server (apps/web, port 4000)
bun run check                   # Biome lint + format check
bun run build                   # production build (apps/web)
bun run start                   # next start (apps/web)
bun run db:push|db:generate|db:migrate   # Drizzle (apps/web)
bun run init-db                 # one-time DB setup script
```

## Invariant pointers (read `docs/context/invariants.md` in full)

- DB driver stays `pg`/TCP (`drizzle-orm/node-postgres`) — never
  `@neondatabase/serverless`; `credit-config.ts` stays DB-free.
- Generation is synchronous inside a 100s origin wall (85s upstream cap);
  seedream-5.0-lite + qwen only; the similarity gate wraps every expression
  attempt; keep BytePlus/ARK and PiAPI funded.
- No watermark on any tier; limits 3/50/unlimited enforced in the API layer.
- Zeabur builds the root Dockerfile — port 3000 and the `/` health check are
  the contract.
- Never commit credentials, `.env*`, local agent settings (`.claude/`,
  `.codex`, `.firecrawl/`), or cache artifacts; no active instruction may
  depend on a personal absolute path.

## Rules for agents

1. **User is product owner**. They decide, you execute. Explain trade-offs.
2. **No jargon**. Translate technical terms for non-technical stakeholders.
3. **Push back** on over-engineering. Suggest simpler solutions first.
4. **Be honest** about limitations and timelines.
5. **Keep changes minimal** and inside the existing monorepo layout — no new
   apps, packages, or abstractions without a stated need.
6. **Ship real code**. Not mocks. Working, tested, styled product.
7. **Use existing patterns** in `apps/web/components/` and `apps/web/lib/`.
8. **Handle errors**. Every async call needs loading/error states.
9. **Test before declaring done**: `bun run check` and `bun run build` from
   the repo root must pass.
10. **Document decisions** in `docs/context/` when they change product,
    architecture, operations, or an invariant.

## License

MIT
