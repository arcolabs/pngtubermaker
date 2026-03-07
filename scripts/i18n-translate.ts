/**
 * i18n translation script — translates messages/en.json to all target locales.
 * Calls OpenAI-compatible APIs.
 *
 * Usage:
 *   bun run scripts/i18n-translate.ts              # translate if changed
 *   bun run scripts/i18n-translate.ts --force       # force full translation
 *   bun run scripts/i18n-translate.ts --dry-run     # preview
 *
 * Environment variables (reads from .env via Bun):
 *   I18N_API_KEY       API key (required)
 *   I18N_BASE_URL      API endpoint (default: https://api.openai.com/v1)
 *   I18N_MODEL         Model name (default: gpt-4o-mini)
 *   I18N_CONCURRENCY   Concurrent requests (default: 5)
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const MESSAGES_DIR = join(ROOT, "messages");
const EN_FILE = join(MESSAGES_DIR, "en.json");
const MANIFEST_PATH = join(MESSAGES_DIR, ".manifest.json");

const TARGET_LOCALES = [
  "zh-CN",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "pt-BR",
  "it",
  "ru",
  "ar",
  "hi",
] as const;

const LOCALE_NAMES: Record<string, string> = {
  "zh-CN": "Simplified Chinese",
  ja: "Japanese",
  ko: "Korean",
  es: "Spanish",
  fr: "French",
  de: "German",
  "pt-BR": "Brazilian Portuguese",
  it: "Italian",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
};

const API_KEY = process.env.I18N_API_KEY || "";
const BASE_URL = (
  process.env.I18N_BASE_URL || "https://api.openai.com/v1"
).replace(/\/+$/, "");
const MODEL = process.env.I18N_MODEL || "gpt-4o-mini";
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.I18N_CONCURRENCY || "5", 10) || 5,
);
const MAX_RETRIES = 3;

// ── ANSI helpers ─────────────────────────────────────────────────────
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

// ── Manifest & hashing ──────────────────────────────────────────────

interface Manifest {
  generatedAt: string;
  hash: string;
}

function hashFile(filePath: string): string {
  const content = readFileSync(filePath);
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(content);
  return hasher.digest("hex").slice(0, 16);
}

function loadManifest(): Manifest | null {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function saveManifest(hash: string): void {
  const manifest: Manifest = { generatedAt: new Date().toISOString(), hash };
  Bun.write(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

// ── Response cleaning ───────────────────────────────────────────────

function cleanResponse(raw: string): string {
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "");
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

// ── Structure validation ────────────────────────────────────────────

function validateStructure(
  source: unknown,
  translated: unknown,
  path = "",
): string[] {
  const errors: string[] = [];

  if (Array.isArray(source)) {
    if (!Array.isArray(translated)) {
      errors.push(`${path}: expected array, got ${typeof translated}`);
      return errors;
    }
    if (source.length !== translated.length) {
      errors.push(
        `${path}: array length mismatch (expected ${source.length}, got ${(translated as unknown[]).length})`,
      );
      return errors;
    }
    for (let i = 0; i < source.length; i++) {
      errors.push(
        ...validateStructure(
          source[i],
          (translated as unknown[])[i],
          `${path}[${i}]`,
        ),
      );
    }
    return errors;
  }

  if (source !== null && typeof source === "object") {
    if (translated === null || typeof translated !== "object") {
      errors.push(`${path}: expected object, got ${typeof translated}`);
      return errors;
    }
    const srcKeys = Object.keys(source as Record<string, unknown>).sort();
    const tgtKeys = Object.keys(translated as Record<string, unknown>).sort();
    const missingKeys = srcKeys.filter((k) => !tgtKeys.includes(k));
    if (missingKeys.length > 0) {
      errors.push(`${path}: missing keys: ${missingKeys.join(", ")}`);
    }
    for (const key of srcKeys) {
      if (tgtKeys.includes(key)) {
        errors.push(
          ...validateStructure(
            (source as Record<string, unknown>)[key],
            (translated as Record<string, unknown>)[key],
            path ? `${path}.${key}` : key,
          ),
        );
      }
    }
    return errors;
  }

  if (typeof source === "string" && typeof translated === "string") {
    const srcVars = (source.match(/\{[^}]+\}/g) || []).sort();
    const tgtVars = ((translated as string).match(/\{[^}]+\}/g) || []).sort();
    if (srcVars.join(",") !== tgtVars.join(",")) {
      errors.push(
        `${path}: interpolation mismatch — expected [${srcVars.join(", ")}], got [${tgtVars.join(", ")}]`,
      );
    }
  }

  return errors;
}

// ── API call ────────────────────────────────────────────────────────

interface TranslationTask {
  locale: string;
  sourceContent: string;
  sourceJson: unknown;
}

interface TranslationResult {
  locale: string;
  success: boolean;
  error?: string;
}

async function translateOne(task: TranslationTask): Promise<TranslationResult> {
  const { locale, sourceContent, sourceJson } = task;
  const languageName = LOCALE_NAMES[locale] || locale;

  const systemPrompt = `You are a professional translator. Translate the following JSON from English to ${languageName}.

Rules:
- Return ONLY valid JSON. No explanation, no commentary, no markdown.
- Preserve the exact JSON structure: same keys, same nesting, same array lengths.
- Preserve interpolation variables like {name}, {year}, {count}, {percent} exactly as-is.
- Preserve HTML-like tags like <primary>...</primary> exactly as-is (they are markup tags, not translatable content).
- Do NOT translate brand names (PNGTuberMaker, PNGTuber, OBS, Discord, Twitch, YouTube, etc.).
- Translate naturally for the target audience, not word-for-word.
- Return the complete JSON object.`;

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sourceContent },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from API");

  const cleaned = cleanResponse(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `JSON parse failed: ${(e as Error).message}\n${cleaned.slice(0, 300)}`,
    );
  }

  const errors = validateStructure(sourceJson, parsed);
  if (errors.length > 0) {
    throw new Error(`Structure validation:\n  ${errors.join("\n  ")}`);
  }

  await Bun.write(
    join(MESSAGES_DIR, `${locale}.json`),
    `${JSON.stringify(parsed, null, 2)}\n`,
  );

  return { locale, success: true };
}

async function translateWithRetry(
  task: TranslationTask,
): Promise<TranslationResult> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await translateOne(task);
    } catch (e) {
      const msg = (e as Error).message;
      if (attempt === MAX_RETRIES) {
        return { locale: task.locale, success: false, error: msg };
      }
      console.log(
        dim(
          `  retry ${attempt}/${MAX_RETRIES} for ${task.locale}: ${msg.split("\n")[0]}`,
        ),
      );
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return { locale: task.locale, success: false, error: "max retries" };
}

// ── Concurrency pool ────────────────────────────────────────────────

async function runPool(tasks: TranslationTask[]): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      const task = tasks[i];
      const result = await translateWithRetry(task);
      results.push(result);
      const status = result.success ? green("ok") : red("FAIL");
      console.log(
        `  ${status}  ${task.locale.padEnd(6)}${result.error ? dim(` — ${result.error.split("\n")[0].slice(0, 60)}`) : ""}`,
      );
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

// ── Main ────────────────────────────────────────────────────────────

const forceMode = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

if (!dryRun && !API_KEY) {
  console.log(red("Error: I18N_API_KEY is required."));
  console.log(dim("  Set it in .env or as an environment variable."));
  process.exit(1);
}

const currentHash = hashFile(EN_FILE);
const manifest = loadManifest();
const needsTranslation =
  forceMode || !manifest || manifest.hash !== currentHash;

if (!needsTranslation) {
  console.log(green("All translations up to date."));
  process.exit(0);
}

console.log(bold("i18n: translating messages/en.json\n"));
console.log(
  dim(
    `  ${TARGET_LOCALES.length} locales | model: ${MODEL} | concurrency: ${CONCURRENCY}`,
  ),
);

if (dryRun) {
  console.log(bold("\n  --dry-run: would translate to:\n"));
  for (const locale of TARGET_LOCALES) {
    console.log(`    ${locale} (${LOCALE_NAMES[locale]})`);
  }
  process.exit(0);
}

console.log();

const sourceContent = readFileSync(EN_FILE, "utf-8");
const sourceJson = JSON.parse(sourceContent);

const tasks: TranslationTask[] = TARGET_LOCALES.map((locale) => ({
  locale,
  sourceContent,
  sourceJson,
}));

const startTime = Date.now();
const results = await runPool(tasks);
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

const succeeded = results.filter((r) => r.success).length;
const failed = results.filter((r) => !r.success).length;

console.log();
if (failed === 0) {
  console.log(green(`All ${succeeded} translations completed in ${elapsed}s.`));
  saveManifest(currentHash);
  console.log(dim("Updated messages/.manifest.json"));
} else {
  console.log(
    yellow(
      `${succeeded} succeeded, ${red(`${failed} failed`)} in ${elapsed}s.`,
    ),
  );
  console.log(yellow("\nRe-run to retry failed translations."));
  process.exit(1);
}
