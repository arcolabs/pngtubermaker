#!/usr/bin/env bash
# Post-deploy verification for the 2026-09-15 SEO audit batch (fix 418cfb2,
# 4e87853; record seo-audit-2026-09-15.md). PASS = the measured number moved.
# usage: seo-verify.sh [BASE_URL]   (default: live)
set -u
BASE="${1:-https://pngtubermaker.com}"
pass=0; fail=0
chk()  { if [ "$2" = "$3" ]; then echo "PASS  $1"; pass=$((pass+1));
       else echo "FAIL  $1  expected=[$2] got=[$3]"; fail=$((fail+1)); fi; }
page() { curl -sL --compressed --max-time 40 "$BASE$1" 2>/dev/null; }
canon() { page "$1" | grep -aoE '<link rel="canonical" href="[^"]*"' | head -1 | sed -E 's/.*href="([^"]*)".*/\1/'; }

# finding: 4 pages declared the HOMEPAGE as their canonical (blanket inheritance)
chk "canonical /partners"      "$BASE/partners"      "$(canon /partners)"
chk "canonical /legal/terms"   "$BASE/legal/terms"   "$(canon /legal/terms)"
chk "canonical /legal/privacy" "$BASE/legal/privacy" "$(canon /legal/privacy)"
chk "canonical /legal/refund"  "$BASE/legal/refund"  "$(canon /legal/refund)"
# locale variants consolidate onto the English canonical (intended until the
# locale policy lands)
chk "canonical /ja/partners"   "$BASE/partners"      "$(canon /ja/partners)"

sm=$(curl -sL --compressed --max-time 60 "$BASE/sitemap.xml" 2>/dev/null)
# finding: 11 locale-root entries 308'd (trailing slash in <loc>).
# A loc ending in "/index" never occurs; "/</loc>" is the trailing-slash form.
chk "sitemap trailing-slash locs == 0" "0" "$(echo "$sm" | grep -acE '<loc>[^<]*/</loc>' || true)"
chk "sitemap has no /create == 0" "0" "$(echo "$sm" | grep -ac '/create' || true)"
chk "sitemap lastmod count == 0" "0" "$(echo "$sm" | grep -ac '<lastmod>' || true)"

echo
echo "TOTAL: $((pass+fail)) checks, $pass PASS, $fail FAIL"
[ "$fail" -eq 0 ]
