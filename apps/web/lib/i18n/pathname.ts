export function stripLocalePrefix(pathname: string): string {
  // Strip any locale-like prefix (e.g. /en, /ja, /zh-CN) regardless of
  // whether it's a known locale. This handles invalid locales like /jp
  // that might be in the URL due to typos or outdated links.
  const match = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/|$)/);
  if (match) {
    // match[1] = locale code, match[0] = /locale, slice after locale code + /
    return pathname.slice(match[1].length + 1) || "/";
  }
  return pathname;
}
