#!/usr/bin/env bash
# Coverage ratchet: every PUBLIC route must be listed in the sitemap.
#
# Why this exists (2026-09-24): three pages shipped through the organic Work
# loop (/pngtuber-models, /obs-pngtuber, /picrew-pngtuber-maker) and were
# registered in NEITHER discoverability surface — sitemap staticRoutes nor the
# footer. They returned 200 with real content, and the 2026-09-15 audit did not
# catch them because that audit swept sitemap -> URLs (top-down): a page absent
# from the sitemap is invisible to that method by construction. seo-verify.sh
# likewise asserted only sitemap PROPERTIES (no trailing slash, no /create, no
# lastmod), never coverage.
#
# The deeper cause is that these pages use a different content model from the
# registered landing pages. The seven registered ones load copy through
# getLandingPage() from messages/<locale>/landing-<slug>.json and are enumerated
# in LANDING_SLUGS; these three hardcode their copy in the route file and call
# getLandingPage() zero times, so LANDING_SLUGS was never an applicable
# registration point for them. Two page styles, one of them with no registry —
# which is why a filesystem-derived ratchet is the right guard: it asks "does
# this route exist" rather than "did you remember the right registry".
#
# This check runs the other direction: filesystem routes -> sitemap. It FAILS
# CLOSED on any public route that is neither listed nor explicitly EXCLUDED, so
# the next page added without registration breaks CI instead of shipping
# invisible. Add an exclusion only with a stated reason.
#
# Usage: seo-coverage-check.sh            # read the built sitemap artifact
#        seo-coverage-check.sh <BASE_URL> # fetch the sitemap from a live host
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT" || exit 2

MAIN_DIR="apps/web/app/[locale]/(main)"
SHOWCASE_DIR="apps/web/app/[locale]/showcase"

# Deliberately NON-indexable routes. Format: <route>:<reason>
#
# Scope note: only routes under $MAIN_DIR and $SHOWCASE_DIR are enumerated.
# /login sits outside both, so it is structurally out of scope rather than
# excluded — listing it here would be a dead entry that reads as if it were
# being checked. Widen the find below if that ever changes.
EXCLUDED=(
  "create:auth-gated; 307s anonymous visitors and crawlers to /login (removed from the sitemap 2026-09-16)"
  "dashboard:authenticated app surface, robots-disallowed"
  "admin:authenticated admin surface, robots-disallowed"
  "admin/badges:authenticated admin surface, robots-disallowed"
  "admin/customers:authenticated admin surface, robots-disallowed"
  "admin/customers/[id]:authenticated admin surface, robots-disallowed"
  "admin/partners:authenticated admin surface, robots-disallowed"
  "avatars:authenticated gallery, robots-disallowed"
  "avatars/[id]:dynamic per-user route, unbounded URL space"
)

# Routes that are SITEMAP-LISTED but deliberately carry no inbound link, and so
# are exempt from check 6 only (they are still required to be listed by check 3).
# Format: <route>:<reason>
#
# This is a debt ledger, not a pass. Every entry prints WARN and is counted, and
# emptying the ledger turns the route into a hard FAIL (verified 2026-09-24), so
# the exemption cannot become the default way to make check 6 green.
LINK_EXEMPT=(
  "showcase:KNOWN ORPHAN, unfixed. Measured 2026-09-24: in the sitemap at all 12 locales, serves 200 with 354 lines of real content, and a crawl of all 14 EN sitemap surfaces found ZERO navigational inbound hrefs - its only inbound is its own <link rel=canonical> self-reference, which is not navigation. Same class as the three organic pages this ratchet was written for, but it was not created by the Arcops loop and linking it is a product/nav decision (label, placement, whether it deserves chrome space), so it is recorded here rather than silently shipped. See docs/context/seo-audit-2026-09-24.md"
)

pass=0
fail=0
warn=0

chk() {
  if [ "$2" = "$3" ]; then
    echo "PASS  $1"
    pass=$((pass + 1))
  else
    echo "FAIL  $1  expected=[$2] got=[$3]"
    fail=$((fail + 1))
  fi
}

exclusion_reason() {
  local route="$1" entry
  for entry in "${EXCLUDED[@]}"; do
    if [ "${entry%%:*}" = "$route" ]; then
      echo "${entry#*:}"
      return 0
    fi
  done
  return 1
}

link_exempt_reason() {
  local route="$1" entry
  for entry in "${LINK_EXEMPT[@]}"; do
    if [ "${entry%%:*}" = "$route" ]; then
      echo "${entry#*:}"
      return 0
    fi
  done
  return 1
}

# ── 1. the sitemap ───────────────────────────────────────────────────────────
if [ -n "${SEO_SITEMAP_FILE:-}" ]; then
  # Explicit input. Lets the ratchet be tested against a synthetic sitemap
  # (e.g. proving it fails on the pre-fix state) without mutating the real
  # build artifact.
  echo "source: SEO_SITEMAP_FILE=$SEO_SITEMAP_FILE"
  if [ ! -f "$SEO_SITEMAP_FILE" ]; then
    echo "SEO_SITEMAP_FILE not readable: $SEO_SITEMAP_FILE" >&2
    exit 2
  fi
  SM=$(cat "$SEO_SITEMAP_FILE")
elif [ "${1:-}" != "" ]; then
  BASE="${1%/}"
  echo "source: live $BASE/sitemap.xml"
  SM=$(curl -sL --compressed --max-time 60 "$BASE/sitemap.xml" 2>/dev/null)
else
  BODY="apps/web/.next/server/app/sitemap.xml.body"
  if [ ! -f "$BODY" ]; then
    echo "no built sitemap at $BODY; run 'bun run build' first, or pass a BASE_URL" >&2
    exit 2
  fi
  echo "source: built artifact $BODY"
  SM=$(cat "$BODY")
fi

# Compare on path only, so a localhost-built artifact and a live fetch both work.
# The root loc carries NO path component at all (<loc>http://host</loc>), so a
# bare host strip would leave an empty string where "/" is meant; normalise it.
paths=$(printf '%s' "$SM" |
  grep -oE '<loc>[^<]*</loc>' |
  sed -E 's|</?loc>||g' |
  sed -E 's|^https?://[^/]+||' |
  sed -E 's|^$|/|')

chk "sitemap yields >0 locs" "yes" "$([ -n "$paths" ] && echo yes || echo no)"

# ── 2. filesystem routes that ship a page.tsx ────────────────────────────────
# The prefix must be stripped per-source-dir, because a group-root page.tsx
# collapses to the bare filename "page.tsx" for BOTH the (main) group root
# (which is the homepage) and the showcase group (which is /showcase). Stripping
# one prefix blindly conflated them and silently skipped /showcase entirely,
# which is exactly the class of hole this ratchet exists to prevent.
routes=()
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    "$MAIN_DIR"/*)
      r="${f#"$MAIN_DIR"/}"
      # the (main) group root is the homepage; asserted separately in check 4
      [ "$r" = "page.tsx" ] && continue
      r="${r%/page.tsx}"
      ;;
    "$SHOWCASE_DIR"/*)
      r="${f#"$SHOWCASE_DIR"/}"
      # strip the trailing filename with no leading slash: a group root yields
      # exactly "page.tsx", so "${r%/page.tsx}" would not match and would leak a
      # bogus "/page.tsx" route (found by the self-audit below).
      r="${r%page.tsx}"
      r="${r%/}"
      [ -z "$r" ] && r="showcase"
      ;;
    *)
      continue
      ;;
  esac
  [ -z "$r" ] && continue
  routes+=("$r")
done < <(find "$MAIN_DIR" "$SHOWCASE_DIR" -name page.tsx 2>/dev/null | sort)

chk "found >0 filesystem routes" "yes" "$([ ${#routes[@]} -gt 0 ] && echo yes || echo no)"

# Assert the enumeration covers what it claims to, so a future directory rename
# fails loudly instead of quietly checking nothing.
for expected in showcase pricing vtuber-maker; do
  found=no
  for r in "${routes[@]}"; do
    [ "$r" = "$expected" ] && found=yes
  done
  chk "enumeration includes /$expected" "yes" "$found"
done

# ── 3. every non-excluded route must be listed ───────────────────────────────
missing=0
for r in "${routes[@]}"; do
  if reason=$(exclusion_reason "$r"); then
    echo "SKIP  /$r  (excluded: $reason)"
    continue
  fi
  if printf '%s\n' "$paths" | grep -qxF "/$r"; then
    chk "listed /$r" "yes" "yes"
  else
    chk "listed /$r" "yes" "no"
    missing=$((missing + 1))
  fi
done

# ── 4. the homepage is listed exactly once ───────────────────────────────────
root_count=$(printf '%s\n' "$paths" | grep -cxE '/' || true)
chk "homepage listed exactly once" "1" "$root_count"

# ── 5. EN-only routes must not emit locale variants ──────────────────────────
# The three organic pages are English-only by construction: their own copy is
# hardcoded in the route file while only shared sections localise. Listing
# /ja/<page> would advertise a translation that does not exist, and each page
# already canonicalises to the EN URL.
for r in pngtuber-models obs-pngtuber picrew-pngtuber-maker; do
  n=$(printf '%s\n' "$paths" | grep -cE "^/[a-z]{2}(-[A-Z]{2})?/$r$" || true)
  chk "EN-only /$r emits 0 locale variants" "0" "$n"
done

# ── 6. every sitemap-listed route must also be LINKED from global chrome ─────
# The other half of acceptance 6 in runbook 0075: "sitemap contains it AND a
# reachable page links it". Check 3 alone cannot see this, and the gap is not
# hypothetical: /showcase is listed at all 12 locales, serves 200, and had zero
# navigational inbound links (measured 2026-09-24 by crawling all 14 EN sitemap
# surfaces; its only inbound was its own <link rel=canonical> self-reference).
# A sitemap-only ratchet passes that silently, which is the exact failure mode
# this file exists to prevent.
#
# Scope is deliberately Footer.tsx + Header.tsx rather than a full crawl: global
# chrome renders on every page, so a link there proves reachability from any
# entry point, and a source read is deterministic and needs no server. Documented
# limit: it does not catch a route linked only from one other page's body, so a
# route could pass here while being one link from orphaned.
CHROME=("apps/web/components/layout/Footer.tsx" "apps/web/components/layout/Header.tsx")
chrome_hrefs=""
chrome_found=0
for cf in "${CHROME[@]}"; do
  if [ ! -f "$cf" ]; then
    echo "FAIL  global chrome file missing: $cf"
    fail=$((fail + 1))
    continue
  fi
  n=$(grep -oE 'href="/[^"]*"' "$cf" | wc -l)
  chrome_found=$((chrome_found + n))
  chrome_hrefs="$chrome_hrefs
$(grep -oE 'href="/[^"]*"' "$cf" | sed -E 's/^href="//; s/"$//')"
done
chk "global chrome yields >0 hrefs" "yes" "$([ "$chrome_found" -gt 0 ] && echo yes || echo no)"

for r in "${routes[@]}"; do
  # Excluded routes are auth-gated or non-indexable: linking them in global chrome
  # would expose surfaces robots.txt is told not to crawl.
  exclusion_reason "$r" >/dev/null && continue
  if printf '%s\n' "$chrome_hrefs" | grep -qxF "/$r"; then
    chk "linked /$r" "yes" "yes"
  elif reason=$(link_exempt_reason "$r"); then
    echo "WARN  /$r  (link-exempt debt: $reason)"
    warn=$((warn + 1))
  else
    chk "linked /$r" "yes" "no"
    fail=$((fail + 1))
  fi
done

echo
if [ "$missing" -gt 0 ]; then
  echo "UNLISTED PUBLIC ROUTES: $missing  (register in apps/web/app/sitemap.ts,"
  echo "  or add to EXCLUDED above with a reason)"
fi
echo "TOTAL: $((pass + fail)) checks, $pass PASS, $fail FAIL, $warn WARN (link-exempt debt)"

[ "$fail" -eq 0 ]
