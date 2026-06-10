/**
 * Production generation adapter.
 *
 * Character generation: 2×GptImage + 2×Seedream in parallel (2×2). Qwen fills
 * remaining slots if either primary model has empty slots.
 *
 * Expression generation: Seedream first (PiAPI, ~33s vs GPT ~48s) → GptImage
 * fallback → Qwen fallback.
 * Every completed expression passes a perceptual-hash similarity gate against
 * the base image — an upstream that silently degrades to text-to-image
 * (HTTP 200, unrelated image) is treated as a failure so the chain advances.
 *
 * Set GENERATION_ADAPTER=production to use this.
 */

import { GptImageAdapter } from "./gpt-image-adapter";
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

export class ProductionAdapter implements GenerationAdapter {
  private gpt = new GptImageAdapter();
  private qwen = new QwenAdapter();
  private seedream = new SeedreamAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const TARGET = 4;
    const GPT_COUNT = 2;
    const SEEDREAM_COUNT = 2;

    // Phase 1: 2×GptImage + 2×Seedream in parallel (2×2)
    console.log(
      `[Production] Phase 1: character generation (${GPT_COUNT}×GptImage + ${SEEDREAM_COUNT}×Seedream)`,
    );

    const [gptResults, seedreamResults] = await Promise.all([
      Promise.allSettled(
        Array.from({ length: GPT_COUNT }, (_, i) =>
          this.gpt.generateCharacterImage(request).then((img) => {
            if (img) console.log(`[Production] GptImage-${i + 1}: success`);
            else console.warn(`[Production] GptImage-${i + 1}: no image`);
            return img;
          }),
        ),
      ),
      Promise.allSettled(
        Array.from({ length: SEEDREAM_COUNT }, (_, i) =>
          this.seedream.generateCharacterImage(request).then((img) => {
            if (img) console.log(`[Production] Seedream-${i + 1}: success`);
            else console.warn(`[Production] Seedream-${i + 1}: no image`);
            return img;
          }),
        ),
      ),
    ]);

    const images: ProviderImage[] = [];
    for (const r of [...gptResults, ...seedreamResults]) {
      if (r.status === "fulfilled" && r.value) images.push(r.value);
    }

    let missing = TARGET - images.length;

    // Phase 2: Qwen fills remaining slots
    if (missing > 0) {
      console.log(`[Production] Phase 2: filling ${missing} slot(s) with Qwen`);
      const qwenResults = await Promise.allSettled(
        Array.from({ length: missing }, () =>
          this.qwen.generateCharacterImage(request),
        ),
      );
      for (let i = 0; i < qwenResults.length; i++) {
        const r = qwenResults[i];
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
        error: "All primary models failed (GptImage + Seedream)",
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
   * Reject completed results whose image is unrelated to the base —
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
    console.log(`[Production] Expression ${request.expression} → Seedream`);
    const seedreamResult = await this.gateExpression(
      await this.seedream.generateExpression(request),
      request,
    );
    if (seedreamResult.status === "completed") return seedreamResult;

    console.warn(
      `[Production] Expression ${request.expression} Seedream failed: ${seedreamResult.error ?? "unknown"}, falling back to GptImage`,
    );
    const gptResult = await this.gateExpression(
      await this.gpt.generateExpression(request),
      request,
    );
    if (gptResult.status === "completed") {
      console.log(
        `[Production] Expression ${request.expression} GptImage fallback succeeded`,
      );
      return gptResult;
    }

    console.warn(
      `[Production] Expression ${request.expression} GptImage failed: ${gptResult.error ?? "unknown"}, falling back to Qwen`,
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
