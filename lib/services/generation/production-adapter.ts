/**
 * Production generation adapter.
 *
 * Character generation: 4× seedream-lite via BytePlus (direct, sync), in
 * parallel, each slot carrying a distinct prompt variant (lite has no seed, so
 * prompt variation is the only way to pull the candidates apart).
 *
 * PiAPI is deliberately NOT on this path. It is a queue — its own metadata puts
 * 78-122s before a task even starts — so a single PiAPI slot dragged a 25s
 * generation to 115s and past the 100s origin wall (2026-07-13), handing the
 * user a 524 for images we had already produced. It is now only reached when
 * BytePlus returns nothing at all, and only if there is budget left to try.
 * A partial candidate set beats a response the user never receives.
 *
 * Expression generation: BytePlus seedream-lite (image-edit) -> PiAPI
 * seedream-5-lite edit -> qwen image-edit. Every completed expression passes a
 * perceptual-hash similarity gate against the base image - an upstream that
 * silently degrades to text-to-image (HTTP 200, unrelated image) is treated as
 * a failure so the chain advances. BytePlus is primary; PiAPI seedream-lite is
 * kept as cross-vendor redundancy; qwen is the last resort.
 *
 * Provider labels reaching candidate_providers / expression rows:
 *   "byteplus-lite" | "piapi-lite" | "qwen"
 *
 * Set GENERATION_ADAPTER=production to use this.
 */

import { BytePlusAdapter } from "./byteplus-adapter";
import { QwenAdapter } from "./qwen-adapter";
import { SeedreamAdapter } from "./seedream-adapter";
import { resemblesBase } from "./similarity";
import type {
  GenerateCharacterRequest,
  GenerateCharacterResult,
  GenerateExpressionRequest,
  GenerateExpressionResult,
  GenerationAdapter,
  ProviderImage,
} from "./types";

/**
 * Per-slot prompt suffixes for the 3 BytePlus character candidates. Lite has
 * no seed, so these lighting/mood modifiers are the only differentiator. Each
 * keeps the upper-body/facing-viewer/white-bg frame from buildCharacterPrompt.
 */
const BYTEPLUS_CHARACTER_VARIANTS = [
  "soft diffused studio lighting, neutral expression",
  "warm golden-hour rim lighting, gentle smile",
  "cool crisp lighting, slight head tilt, cheerful mood",
  "high-key even lighting, three-quarter view, confident look",
];

/**
 * PiAPI is a queue, not a fast path. Its own task metadata puts 78-122s in
 * `created_at → started_at` against 0.3-33s of real generation, so any PiAPI
 * call on the hot path risks the 100s origin wall on its own.
 *
 * It stays as the fallback — but a fallback is only worth attempting if there
 * is time left to spend on it. Past this point in a request we return what we
 * have rather than gamble the whole response on a queue we do not control.
 */
const FALLBACK_DEADLINE_MS = 40_000;

export class ProductionAdapter implements GenerationAdapter {
  private byteplusLite = new BytePlusAdapter();
  private piapiLite = new SeedreamAdapter();
  private qwen = new QwenAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const TARGET = BYTEPLUS_CHARACTER_VARIANTS.length; // 4
    const startedAt = Date.now();

    // Phase 1: 4×byteplus-lite, one distinct prompt variant each, in parallel.
    // Lite exposes no seed, so the variants are what keep the candidates from
    // collapsing toward a single look.
    console.log(
      `[Production] Phase 1: character generation (${TARGET}×byteplus-lite)`,
    );

    const liteResults = await Promise.allSettled(
      BYTEPLUS_CHARACTER_VARIANTS.map((variant, i) =>
        this.byteplusLite
          .generateCharacterImage(request, variant)
          .then((img) => {
            if (img)
              console.log(
                `[Production] byteplus-lite-${i + 1}: success (variant ${i + 1})`,
              );
            else console.warn(`[Production] byteplus-lite-${i + 1}: no image`);
            return img;
          }),
      ),
    );

    const images: ProviderImage[] = [];
    for (const r of liteResults) {
      if (r.status === "fulfilled" && r.value) images.push(r.value);
    }

    // Phase 2: PiAPI only when BytePlus produced nothing at all. A partial set
    // (say 3 of 4) is a fine thing to hand the user; spending 85s of PiAPI queue
    // to top it up is not — that is what pushed a 25s generation to 115s and past
    // the origin wall on 2026-07-13, after the images had already been produced.
    const elapsed = Date.now() - startedAt;
    if (images.length === 0 && elapsed < FALLBACK_DEADLINE_MS) {
      console.warn(
        `[Production] Phase 2: BytePlus produced nothing (${elapsed}ms) — falling back to PiAPI`,
      );
      const fillResults = await Promise.allSettled([
        this.piapiLite.generateCharacterImage(request),
        this.qwen.generateCharacterImage(request),
      ]);
      for (const r of fillResults) {
        if (r.status === "fulfilled" && r.value) images.push(r.value);
      }
    } else if (images.length < TARGET) {
      console.warn(
        `[Production] ${images.length}/${TARGET} candidates — returning a partial set rather than waiting on the PiAPI queue`,
      );
    }

    if (images.length === 0) {
      return {
        status: "failed",
        images: [],
        error: "All models failed (BytePlus, then PiAPI fallback)",
      };
    }

    console.log(`[Production] Final: ${images.length}/${TARGET} images`);
    return {
      status: "completed",
      images: images.map((i) => i.url),
      providers: images.map((i) => i.provider),
    };
  }

  /**
   * Reject completed results whose image is unrelated to the base -
   * converts the upstream "HTTP 200 but garbage" failure mode into a
   * normal failure so the fallback chain advances.
   */
  private async gateExpression(
    result: GenerateExpressionResult,
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    if (result.status !== "completed" || !result.imageUrl) return result;
    const ok = await resemblesBase(
      request.baseImageUrl,
      result.imageUrl,
      `${result.provider ?? "unknown"}:${request.expression}`,
    );
    if (ok) return result;
    return {
      status: "failed",
      imageUrl: null,
      provider: result.provider,
      error: `Similarity gate rejected ${result.provider ?? "unknown"} result (unrelated to base image)`,
    };
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const startedAt = Date.now();

    console.log(
      `[Production] Expression ${request.expression} -> byteplus-lite`,
    );
    const byteplusResult = await this.gateExpression(
      await this.byteplusLite.generateExpression(request),
      request,
    );
    if (byteplusResult.status === "completed") return byteplusResult;

    // Same reasoning as generateCharacter: the PiAPI chain can sit in a queue
    // for 78-122s. Chaining it after a BytePlus attempt that already burned its
    // own budget is how a request ends up past the 100s origin wall — at which
    // point the user sees a 524 no matter what we eventually produce.
    const elapsed = Date.now() - startedAt;
    if (elapsed >= FALLBACK_DEADLINE_MS) {
      console.warn(
        `[Production] Expression ${request.expression}: ${elapsed}ms spent, no budget left for the PiAPI fallback`,
      );
      return byteplusResult;
    }

    console.warn(
      `[Production] Expression ${request.expression} byteplus-lite failed: ${byteplusResult.error ?? "unknown"}, falling back to piapi-lite`,
    );
    const piapiResult = await this.gateExpression(
      await this.piapiLite.generateExpression(request),
      request,
    );
    if (piapiResult.status === "completed") {
      console.log(
        `[Production] Expression ${request.expression} piapi-lite fallback succeeded`,
      );
      return piapiResult;
    }

    console.warn(
      `[Production] Expression ${request.expression} piapi-lite failed: ${piapiResult.error ?? "unknown"}, falling back to Qwen`,
    );
    const qwenResult = await this.gateExpression(
      await this.qwen.generateExpression(request),
      request,
    );
    if (qwenResult.status === "completed") {
      console.log(
        `[Production] Expression ${request.expression} Qwen fallback succeeded`,
      );
    } else {
      console.error(
        `[Production] Expression ${request.expression} all three models failed`,
      );
    }
    return qwenResult;
  }
}
