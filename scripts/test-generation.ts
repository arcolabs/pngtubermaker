/**
 * One-shot validation: exercise the production generation stack against the
 * real upstreams (BytePlus ARK primary + PiAPI fallback, keys from .env,
 * loaded automatically by bun).
 *
 *   bun run scripts/test-piapi-generation.ts
 *
 * Verifies:
 *  1. generateCharacter -> 4 accessible image URLs, providers = 3x byteplus-lite
 *     + 1x qwen (Qwen fills extra slots only if a BytePlus slot fails).
 *  2. generateExpression -> an image URL that passes the perceptual-hash
 *     similarity gate against the base, served by byteplus-lite (primary).
 *
 * No DB, no credits, no Stripe. Calls the adapters directly.
 */

import { ProductionAdapter } from "../lib/services/generation/production-adapter";
import { resemblesBase } from "../lib/services/generation/similarity";
import type { ArtStyle } from "../lib/services/generation/types";

const PROMPT =
  "a cheerful fox girl with orange hair and bright green eyes, wearing a casual white hoodie";
const STYLE: ArtStyle = "anime";

function assert(cond: boolean, msg: string): boolean {
  if (cond) {
    console.log(`  ✅ ${msg}`);
  } else {
    console.error(`  ❌ ${msg}`);
  }
  return cond;
}

async function checkAccessible(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) {
      console.error(`    HTTP ${res.status} for ${url}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 0;
  } catch (e) {
    console.error(
      `    fetch failed for ${url}:`,
      e instanceof Error ? e.message : e,
    );
    return false;
  }
}

async function main() {
  console.log(
    "=== Production stack validation (BytePlus primary + PiAPI fallback) ===",
  );
  console.log(`ARK_BASE_URL=${process.env.ARK_BASE_URL ?? "(unset)"}`);
  console.log(
    `ARK_API_KEY=${process.env.ARK_API_KEY ? `${process.env.ARK_API_KEY.slice(0, 8)}...(${process.env.ARK_API_KEY.length} chars)` : "(UNSET!)"}`,
  );
  console.log(
    `ARK_SEEDREAM_LITE_ENDPOINT=${process.env.ARK_SEEDREAM_LITE_ENDPOINT ?? "(UNSET!)"}`,
  );
  console.log(`PIAPI_BASE_URL=${process.env.PIAPI_BASE_URL ?? "(unset)"}`);
  console.log(
    `PIAPI_KEY=${process.env.PIAPI_KEY ? `${process.env.PIAPI_KEY.slice(0, 6)}...(${process.env.PIAPI_KEY.length} chars)` : "(UNSET!)"}`,
  );
  console.log("");

  const adapter = new ProductionAdapter();

  // ── 1. Character generation ──────────────────────────────────────────────
  console.log(">>> Step 1: generateCharacter");
  const charStart = Date.now();
  const charResult = await adapter.generateCharacter({
    prompt: PROMPT,
    style: STYLE,
    referenceUrl: null,
  });
  const charElapsed = ((Date.now() - charStart) / 1000).toFixed(1);
  console.log(`generateCharacter elapsed: ${charElapsed}s`);
  console.log(`status: ${charResult.status}`);
  console.log(`images: ${charResult.images.length}`);
  if (charResult.error) console.log(`error: ${charResult.error}`);

  const providers = charResult.providers ?? [];
  console.log("\nproviders (aligned with images):");
  const counts: Record<string, number> = {};
  for (const p of providers) counts[p] = (counts[p] ?? 0) + 1;
  console.log(`  counts: ${JSON.stringify(counts)}`);

  const allAccessible: boolean[] = [];
  console.log("\nimage accessibility:");
  for (let i = 0; i < charResult.images.length; i++) {
    const url = charResult.images[i];
    if (!url) continue;
    const ok = await checkAccessible(url);
    allAccessible.push(ok);
    console.log(
      `  [${i}] provider=${providers[i] ?? "?"} accessible=${ok}\n      ${url}`,
    );
  }

  const byteplusCount = counts["byteplus-lite"] ?? 0;
  const piapiCount = counts["piapi-lite"] ?? 0;
  const qwenCount = counts.qwen ?? 0;
  console.log("\n--- Character assertions ---");
  const a1 = assert(charResult.status === "completed", "status === completed");
  const a2 = assert(
    charResult.images.length === 4,
    `exactly 4 images (got ${charResult.images.length})`,
  );
  const a3 = assert(
    allAccessible.every(Boolean) && allAccessible.length === 4,
    "all 4 image URLs accessible & non-empty",
  );
  const a4 = assert(
    byteplusCount === 3 && piapiCount === 0 && qwenCount === 1,
    `provider mix = 3x byteplus-lite + 0 piapi-lite + 1 qwen (got byteplus=${byteplusCount} piapi=${piapiCount} qwen=${qwenCount})`,
  );

  if (qwenCount > 1 || piapiCount > 0) {
    console.log(
      "  ⚠️  Fallback filled slots - a BytePlus slot failed. Provider mix assertion fails by design in that case.",
    );
  }

  if (!a1 || !a2 || !a3 || charResult.images.length === 0) {
    console.error(
      "\nCharacter generation did not yield 4 accessible images; aborting expression test.",
    );
    process.exit(1);
  }

  // ── 2. Expression generation ─────────────────────────────────────────────
  console.log("\n>>> Step 2: generateExpression (happy)");
  // Use the first byteplus-lite candidate as the base for expression editing.
  const baseIdx = providers.indexOf("byteplus-lite");
  const baseImageUrl =
    baseIdx >= 0
      ? (charResult.images[baseIdx] as string)
      : (charResult.images[0] as string);
  const baseProvider =
    baseIdx >= 0 ? (providers[baseIdx] ?? "?") : (providers[0] ?? "?");
  console.log(`base image: provider=${baseProvider}\n  ${baseImageUrl}`);

  const exprStart = Date.now();
  const exprResult = await adapter.generateExpression({
    baseImageUrl,
    expression: "happy",
    style: STYLE,
    prompt: PROMPT,
  });
  const exprElapsed = ((Date.now() - exprStart) / 1000).toFixed(1);
  console.log(`\ngenerateExpression elapsed: ${exprElapsed}s`);
  console.log(`status: ${exprResult.status}`);
  console.log(`provider: ${exprResult.provider ?? "?"}`);
  if (exprResult.error) console.log(`error: ${exprResult.error}`);

  if (exprResult.status !== "completed" || !exprResult.imageUrl) {
    console.error("\nExpression generation failed; cannot evaluate gate.");
    process.exit(1);
  }

  console.log(`\nexpression image:\n  ${exprResult.imageUrl}`);
  const exprAccessible = await checkAccessible(exprResult.imageUrl);
  console.log(`expression image accessible: ${exprAccessible}`);

  // Explicitly re-run the similarity gate against the returned image and
  // print its verdict. generateExpression only returns gated-passed results,
  // so this should be PASS - it confirms the gate is wired in and satisfied.
  console.log("\n--- Similarity gate verdict (base vs expression) ---");
  const gatePassed = await resemblesBase(
    baseImageUrl,
    exprResult.imageUrl,
    `test:happy:${exprResult.provider ?? "unknown"}`,
  );
  console.log(`  gate verdict: ${gatePassed ? "PASS" : "FAIL"}`);

  console.log("\n--- Expression assertions ---");
  const b1 = assert(exprResult.status === "completed", "status === completed");
  const b2 = assert(!!exprResult.imageUrl, "imageUrl present");
  const b3 = assert(exprAccessible, "expression image URL accessible");
  const b4 = assert(
    gatePassed,
    "similarity gate PASS (expression plausibly derives from base)",
  );
  const b5 = assert(
    exprResult.provider === "byteplus-lite",
    `provider is byteplus-lite (primary path held) (got ${exprResult.provider ?? "?"})`,
  );

  console.log("\n=== SUMMARY ===");
  console.log(
    `character: ${[a1, a2, a3, a4].every(Boolean) ? "PASS" : "FAIL"} (status/4-img/accessible/3byteplus+1qwen)`,
  );
  console.log(
    `expression: ${[b1, b2, b3, b4, b5].every(Boolean) ? "PASS" : "FAIL"} (status/url/accessible/gate/byteplus-lite)`,
  );
  console.log(`final expression provider: ${exprResult.provider ?? "?"}`);

  const allPass = [a1, a2, a3, a4, b1, b2, b3, b4, b5].every(Boolean);
  console.log(`\nOVERALL: ${allPass ? "PASS" : "FAIL"}`);
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error("Validation script threw:", e);
  process.exit(1);
});
