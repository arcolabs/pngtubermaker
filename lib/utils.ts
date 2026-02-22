import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatCreditsCompact(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

// ── Avatar name / slug generation ────────────────────────────────────

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "and",
  "but",
  "or",
  "not",
  "so",
  "yet",
  "both",
  "either",
  "neither",
  "each",
  "every",
  "all",
  "any",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "too",
  "very",
  "just",
  "about",
  "also",
  "that",
  "this",
  "these",
  "those",
  "it",
  "its",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "i",
  "me",
  "you",
  "he",
  "she",
  "we",
  "they",
  "them",
  "who",
  "which",
  "what",
  "where",
  "when",
  "how",
  "make",
  "create",
  "generate",
  "design",
  "draw",
  "render",
  "style",
  "like",
  "look",
  "looking",
  "looks",
  "image",
  "picture",
  "photo",
  "illustration",
  "character",
  "avatar",
  "pngtuber",
  "png",
  "tuber",
  "streamer",
]);

/**
 * Generate a readable avatar name from a prompt.
 * Extracts meaningful words, title-cases them, limits to ~4 words.
 */
export function generateAvatarName(prompt: string): string {
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return "My PNGTuber";

  const titleCase = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  return words.slice(0, 4).map(titleCase).join(" ");
}

/**
 * Generate a URL-friendly slug from a name.
 * Appends a short random suffix for uniqueness.
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);

  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base}-${suffix}`;
}

/**
 * Like Promise.allSettled but staggers task launches.
 * Each task starts `delayMs` after the previous one, then all run concurrently.
 */
export function staggeredAllSettled<T>(
  tasks: (() => Promise<T>)[],
  delayMs: number,
): Promise<PromiseSettledResult<T>[]> {
  const promises = tasks.map(
    (task, i) =>
      new Promise<T>((resolve, reject) => {
        setTimeout(() => task().then(resolve, reject), i * delayMs);
      }),
  );
  return Promise.allSettled(promises);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}
