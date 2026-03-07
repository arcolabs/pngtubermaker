/**
 * i18n translation script — translates messages/en/*.json to all target locales.
 * Calls OpenAI-compatible APIs. Supports incremental per-namespace translation.
 *
 * Usage:
 *   bun run scripts/i18n-translate.ts              # translate changed namespaces
 *   bun run scripts/i18n-translate.ts --force       # force full translation
 *   bun run scripts/i18n-translate.ts --dry-run     # preview what would be translated
 *
 * Environment variables (reads from .env via Bun):
 *   I18N_API_KEY       API key (required)
 *   I18N_BASE_URL      API endpoint (default: https://api.openai.com/v1)
 *   I18N_MODEL         Model name (default: gpt-4o-mini)
 *   I18N_CONCURRENCY   Concurrent requests (default: 5)
 *   I18N_MAX_TOKENS    Max tokens per request (default: 32000)
 */

import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const MESSAGES_DIR = join(ROOT, "messages");
const EN_DIR = join(MESSAGES_DIR, "en");
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
const MAX_TOKENS = Math.max(
  1024,
  Number.parseInt(process.env.I18N_MAX_TOKENS || "64000", 10) || 64000,
);

// ── ANSI helpers ─────────────────────────────────────────────────────
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

// ── Manifest & hashing ──────────────────────────────────────────────

interface Manifest {
  generatedAt: string;
  /** Per-namespace hash of the English source file */
  hashes: Record<string, string>;
}

function hashContent(content: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(content);
  return hasher.digest("hex").slice(0, 16);
}

function loadManifest(): Manifest | null {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    const raw = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
    // Migrate from old single-hash format
    if (raw.hash && !raw.hashes) {
      return null; // Force full retranslation on format change
    }
    return raw;
  } catch {
    return null;
  }
}

function saveManifest(hashes: Record<string, string>): void {
  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    hashes,
  };
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

function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      depth++;
      continue;
    }
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1).trim();
      }
    }
  }

  return null;
}

function parseModelJson(raw: string): { parsed: unknown; cleaned: string } {
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, "");
  const cleaned = cleanResponse(raw);

  const candidates: string[] = [];
  if (cleaned) candidates.push(cleaned);

  const balanced = extractBalancedJsonObject(stripped);
  if (balanced && !candidates.includes(balanced)) {
    candidates.push(balanced);
  }

  let lastError = "unknown parse error";
  for (const candidate of candidates) {
    try {
      return { parsed: JSON.parse(candidate), cleaned: candidate };
    } catch (e) {
      lastError = (e as Error).message;
    }
  }

  throw new Error(
    `JSON parse failed: ${lastError}\n${(candidates[0] || stripped).slice(0, 400)}`,
  );
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
  namespace: string;
  sourceContent: string;
  sourceJson: unknown;
}

interface TranslationResult {
  locale: string;
  namespace: string;
  success: boolean;
  parsed?: unknown;
  error?: string;
}

async function translateOne(task: TranslationTask): Promise<TranslationResult> {
  const { locale, namespace, sourceContent, sourceJson } = task;
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
      max_tokens: MAX_TOKENS,
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
    choices: { message: { content: string }; finish_reason?: string }[];
  };
  const finishReason = data.choices?.[0]?.finish_reason;
  if (finishReason === "length") {
    throw new Error(
      "Model output truncated (finish_reason=length), try higher I18N_MAX_TOKENS",
    );
  }
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from API");

  const { parsed } = parseModelJson(raw);

  const errors = validateStructure(sourceJson, parsed);
  if (errors.length > 0) {
    throw new Error(`Structure validation:\n  ${errors.join("\n  ")}`);
  }

  return { locale, namespace, success: true, parsed };
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
        return {
          locale: task.locale,
          namespace: task.namespace,
          success: false,
          error: msg,
        };
      }
      console.log(
        dim(
          `  retry ${attempt}/${MAX_RETRIES} for ${task.locale}/${task.namespace}: ${msg.split("\n")[0]}`,
        ),
      );
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return {
    locale: task.locale,
    namespace: task.namespace,
    success: false,
    error: "max retries",
  };
}

// ── Chunked translation for large files ─────────────────────────────

const CHUNK_THRESHOLD = 5 * 1024; // 5KB — split files larger than this

function buildChunks(json: Record<string, unknown>): Record<string, unknown>[] {
  const keys = Object.keys(json);
  const chunks: Record<string, unknown>[] = [];
  let current: Record<string, unknown> = {};
  let currentSize = 2; // opening/closing braces

  for (const key of keys) {
    const entryJson = JSON.stringify({ [key]: json[key] });
    const entrySize = entryJson.length;

    // If adding this entry would exceed threshold AND current is non-empty, flush
    if (
      currentSize + entrySize > CHUNK_THRESHOLD &&
      Object.keys(current).length > 0
    ) {
      chunks.push(current);
      current = {};
      currentSize = 2;
    }

    current[key] = json[key];
    currentSize += entrySize;
  }

  if (Object.keys(current).length > 0) {
    chunks.push(current);
  }

  return chunks;
}

async function translateChunked(
  task: TranslationTask,
): Promise<TranslationResult> {
  const sourceJson = task.sourceJson as Record<string, unknown>;

  // If small enough, translate as-is
  if (task.sourceContent.length <= CHUNK_THRESHOLD) {
    return translateWithRetry(task);
  }

  const chunks = buildChunks(sourceJson);
  if (chunks.length <= 1) {
    return translateWithRetry(task);
  }

  const merged: Record<string, unknown> = {};
  for (let i = 0; i < chunks.length; i++) {
    const chunkTask: TranslationTask = {
      locale: task.locale,
      namespace: `${task.namespace}[${i + 1}/${chunks.length}]`,
      sourceContent: JSON.stringify(chunks[i], null, 2),
      sourceJson: chunks[i],
    };
    const result = await translateWithRetry(chunkTask);
    if (!result.success) {
      return {
        locale: task.locale,
        namespace: task.namespace,
        success: false,
        error: `chunk ${i + 1}/${chunks.length}: ${result.error}`,
      };
    }
    Object.assign(merged, result.parsed as Record<string, unknown>);
  }

  // Validate merged result against full source
  const errors = validateStructure(sourceJson, merged);
  if (errors.length > 0) {
    return {
      locale: task.locale,
      namespace: task.namespace,
      success: false,
      error: `Merged validation:\n  ${errors.join("\n  ")}`,
    };
  }

  return {
    locale: task.locale,
    namespace: task.namespace,
    success: true,
    parsed: merged,
  };
}

// ── Concurrency pool ────────────────────────────────────────────────

async function runPool(tasks: TranslationTask[]): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      const task = tasks[i];
      const result = await translateChunked(task);
      results.push(result);
      const status = result.success ? green("ok") : red("FAIL");
      console.log(
        `  ${status}  ${task.locale.padEnd(6)} ${task.namespace}${result.error ? dim(` — ${result.error.split("\n")[0].slice(0, 60)}`) : ""}`,
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

// --only de/landing-guides-how-to-make-a-pngtuber → filter to specific locale/namespace
const onlyArg = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
const onlyLocale = onlyArg?.includes("/") ? onlyArg.split("/")[0] : undefined;
const onlyNamespace = onlyArg?.includes("/")
  ? onlyArg.split("/").slice(1).join("/")
  : onlyArg;

if (!dryRun && !API_KEY) {
  console.log(red("Error: I18N_API_KEY is required."));
  console.log(dim("  Set it in .env or as an environment variable."));
  process.exit(1);
}

// Read all English namespace files
const enFiles = readdirSync(EN_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();
const namespaces = enFiles.map((f) => f.replace(/\.json$/, ""));

// Compute per-namespace hashes
const currentHashes: Record<string, string> = {};
const nsContent: Record<string, { raw: string; json: unknown }> = {};
for (const f of enFiles) {
  const ns = f.replace(/\.json$/, "");
  const raw = readFileSync(join(EN_DIR, f), "utf-8");
  currentHashes[ns] = hashContent(raw);
  nsContent[ns] = { raw, json: JSON.parse(raw) };
}

// Determine which namespaces changed
const manifest = loadManifest();
const changedNamespaces = forceMode
  ? namespaces
  : namespaces.filter(
      (ns) =>
        !manifest?.hashes[ns] || manifest.hashes[ns] !== currentHashes[ns],
    );

if (changedNamespaces.length === 0) {
  console.log(green("All translations up to date."));
  process.exit(0);
}

console.log(bold("i18n: translating changed namespaces\n"));
console.log(
  dim(
    `  ${changedNamespaces.length}/${namespaces.length} namespaces changed | ${TARGET_LOCALES.length} locales | model: ${MODEL} | concurrency: ${CONCURRENCY}`,
  ),
);
console.log(dim(`  changed: ${changedNamespaces.join(", ")}`));

if (dryRun) {
  console.log(
    bold(
      `\n  --dry-run: would translate ${changedNamespaces.length} namespaces to ${TARGET_LOCALES.length} locales:\n`,
    ),
  );
  for (const ns of changedNamespaces) {
    console.log(`    ${ns}`);
  }
  process.exit(0);
}

console.log();

// Build tasks only for changed namespaces (filtered by --only if set)
const targetLocales = onlyLocale
  ? TARGET_LOCALES.filter((l) => l === onlyLocale)
  : TARGET_LOCALES;
const targetNamespaces =
  onlyNamespace && nsContent[onlyNamespace]
    ? [onlyNamespace]
    : changedNamespaces;

const tasks: TranslationTask[] = [];
for (const locale of targetLocales) {
  for (const ns of targetNamespaces) {
    const { raw, json } = nsContent[ns];
    tasks.push({
      locale,
      namespace: ns,
      sourceContent: raw,
      sourceJson: json,
    });
  }
}

const startTime = Date.now();
const results = await runPool(tasks);
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

const succeeded = results.filter((r) => r.success).length;
const failed = results.filter((r) => !r.success).length;
const failedTasks = results.filter((r) => !r.success);

console.log();

// Write results per locale/namespace
for (const result of results) {
  if (!result.success || !result.parsed) continue;
  const localeDir = join(MESSAGES_DIR, result.locale);
  if (!existsSync(localeDir)) mkdirSync(localeDir, { recursive: true });
  await Bun.write(
    join(localeDir, `${result.namespace}.json`),
    `${JSON.stringify(result.parsed, null, 2)}\n`,
  );
}

if (failed === 0) {
  console.log(green(`All ${succeeded} tasks completed in ${elapsed}s.`));
  // Update manifest with all current hashes (including unchanged)
  saveManifest(currentHashes);
  console.log(dim("Updated messages/.manifest.json"));
} else {
  // Only update hashes for namespaces where ALL locales succeeded
  const failedNs = new Set(failedTasks.map((r) => r.namespace));
  const updatedHashes: Record<string, string> = {
    ...(manifest?.hashes ?? {}),
  };
  for (const ns of changedNamespaces) {
    if (!failedNs.has(ns)) {
      updatedHashes[ns] = currentHashes[ns];
    }
  }
  saveManifest(updatedHashes);

  console.log(
    yellow(
      `${succeeded} tasks succeeded, ${red(`${failed} failed`)} in ${elapsed}s.`,
    ),
  );
  for (const t of failedTasks) {
    console.log(
      red(
        `  FAIL ${t.locale}/${t.namespace}: ${t.error?.split("\n")[0].slice(0, 80)}`,
      ),
    );
  }
  console.log(yellow("\nRe-run to retry failed translations."));
  process.exit(1);
}
