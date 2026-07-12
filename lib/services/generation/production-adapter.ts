/**
 * Production generation adapter.
 *
 * Character generation: 3× seedream-lite via BytePlus (direct, sync) + 1× qwen
 * via PiAPI, all in parallel. The three BytePlus slots each carry a distinct
 * prompt variant (lite has no seed, so prompt variation is the only way to
 * pull the candidates apart). Any empty slot is filled by Qwen so we always
 * try to return 4.
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
];

export class ProductionAdapter implements GenerationAdapter {
  private byteplusLite = new BytePlusAdapter();
  private piapiLite = new SeedreamAdapter();
  private qwen = new QwenAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const TARGET = 4;
    const LITE_COUNT = BYTEPLUS_CHARACTER_VARIANTS.length; // 3

    // Phase 1: 3×byteplus-lite (distinct variants) + 1×qwen, all parallel.
    console.log(
      `[Production] Phase 1: character generation (${LITE_COUNT}×byteplus-lite + 1×qwen)`,
    );

    const [liteResults, qwenResults] = await Promise.all([
      Promise.allSettled(
        BYTEPLUS_CHARACTER_VARIANTS.map((variant, i) =>
          this.byteplusLite
            .generateCharacterImage(request, variant)
            .then((img) => {
              if (img)
                console.log(
                  `[Production] byteplus-lite-${i + 1}: success (variant ${i + 1})`,
                );
              else
                console.warn(`[Production] byteplus-lite-${i + 1}: no image`);
              return img;
            }),
        ),
      ),
      Promise.allSettled([
        this.qwen.generateCharacterImage(request).then((img) => {
          if (img) console.log(`[Production] qwen-1: success`);
          else console.warn(`[Production] qwen-1: no image`);
          return img;
        }),
      ]),
    ]);

    const images: ProviderImage[] = [];
    for (const r of [...liteResults, ...qwenResults]) {
      if (r.status === "fulfilled" && r.value) images.push(r.value);
    }

    let missing = TARGET - images.length;

    // Phase 2: Qwen fills any remaining slots.
    if (missing > 0) {
      console.log(`[Production] Phase 2: filling ${missing} slot(s) with Qwen`);
      const fillResults = await Promise.allSettled(
        Array.from({ length: missing }, () =>
          this.qwen.generateCharacterImage(request),
        ),
      );
      for (let i = 0; i < fillResults.length; i++) {
        const r = fillResults[i];
        if (r?.status === "fulfilled" && r.value) {
          images.push(r.value);
          console.log(`[Production] Qwen-fallback-${i + 1}: success`);
        } else {
          console.warn(
            `[Production] Qwen-fallback-${i + 1}: failed`,
            r?.status === "rejected" ? r.reason : "no image",
          );
        }
      }
      missing = TARGET - images.length;
    }

    if (images.length === 0) {
      return {
        status: "failed",
        images: [],
        error: "All primary models failed (byteplus-lite + qwen)",
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
    console.log(
      `[Production] Expression ${request.expression} -> byteplus-lite`,
    );
    const byteplusResult = await this.gateExpression(
      await this.byteplusLite.generateExpression(request),
      request,
    );
    if (byteplusResult.status === "completed") return byteplusResult;

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
