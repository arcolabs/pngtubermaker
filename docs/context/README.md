# Project Context — Ownership

This directory is the **authoritative, active project context** for the
PNGTuberMaker monorepo. It consolidates what used to be scattered across
`AGENTS.md`, `README.md`, and the dated plan documents.

## Files

- `product.md` — what the product is, who it serves, pricing, brand rules.
- `architecture.md` — stack, monorepo layout, application structure, generation stack.
- `operations.md` — deployment, environment variables, scheduled jobs, monitoring.
- `invariants.md` — active engineering invariants. Violating these has caused
  production incidents; change them only deliberately.

## Ownership rules

1. **Active truth lives here.** If this directory and any other document
   disagree, this directory wins. Fix the other document or move it to
   `docs/legacy/`.
2. **Update in the same PR.** Any change to product behavior, architecture,
   deployment, or an invariant must update the relevant file here in the same
   commit. Stale context is treated as a defect.
3. **`AGENTS.md` at the repository root** carries only monorepo-wide agent
   instructions and pointers into this directory. It must not grow product
   detail that belongs here.
4. **`docs/legacy/` is historical.** Dated plans, task lists, and postmortems
   are kept for archaeology only. Never treat them as current instructions,
   and never "resurrect" a decision from them without re-validating it against
   the code.
5. **No personal context.** This repository must not depend on machine-specific
   absolute paths, personal agent settings, credentials, or cross-project
   private operations. Local agent tooling (`.claude/`, `.codex`, `.firecrawl/`)
   is gitignored, not committed.
