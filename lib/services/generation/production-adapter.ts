/**
 * Production generation adapter.
 *
 * Character generation: 2×GptImage + 2×Doubao in parallel (2×2). Qwen fills
 * remaining slots if either primary model has empty slots.
 *
 * Expression generation: GptImage first → Qwen fallback → Doubao fallback.
 *
 * Set GENERATION_ADAPTER=production to use this.
 */

import { DoubaoSeedreamAdapter } from "./doubao-seedream-adapter";
import { GptImageAdapter } from "./gpt-image-adapter";
import { QwenAdapter } from "./qwen-adapter";
import type {
  GenerateCharacterRequest,
  GenerateCharacterResult,
  GenerateExpressionRequest,
  GenerateExpressionResult,
  GenerationAdapter,
} from "./types";

export class ProductionAdapter implements GenerationAdapter {
  private gpt = new GptImageAdapter();
  private qwen = new QwenAdapter();
  private doubao = new DoubaoSeedreamAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const TARGET = 4;
    const GPT_COUNT = 2;
    const DOUBAO_COUNT = 2;

    // Phase 1: 2×GptImage + 2×Doubao in parallel (2×2)
    console.log(
      `[Production] Phase 1: character generation (${GPT_COUNT}×GptImage + ${DOUBAO_COUNT}×Doubao)`,
    );

    const [gptResults, doubaoResults] = await Promise.all([
      Promise.allSettled(
        Array.from({ length: GPT_COUNT }, (_, i) =>
          this.gpt.generateCharacterImage(request).then((url) => {
            if (url) console.log(`[Production] GptImage-${i + 1}: success`);
            else console.warn(`[Production] GptImage-${i + 1}: no image`);
            return url;
          }),
        ),
      ),
      Promise.allSettled(
        Array.from({ length: DOUBAO_COUNT }, (_, i) =>
          this.doubao.generateCharacterImage(request).then((url) => {
            if (url) console.log(`[Production] Doubao-${i + 1}: success`);
            else console.warn(`[Production] Doubao-${i + 1}: no image`);
            return url;
          }),
        ),
      ),
    ]);

    const images: string[] = [];
    for (const r of gptResults) {
      if (r.status === "fulfilled" && r.value) images.push(r.value);
    }
    for (const r of doubaoResults) {
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
        error: "All primary models failed (GptImage + Doubao)",
      };
    }

    console.log(`[Production] Final: ${images.length}/${TARGET} images`);
    return { status: "completed", images };
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    console.log(`[Production] Expression ${request.expression} → GptImage`);
    const gptResult = await this.gpt.generateExpression(request);
    if (gptResult.status === "completed") return gptResult;

    console.warn(
      `[Production] Expression ${request.expression} GptImage failed: ${gptResult.error ?? "unknown"}, falling back to Qwen`,
    );
    const qwenResult = await this.qwen.generateExpression(request);
    if (qwenResult.status === "completed") {
      console.log(
        `[Production] Expression ${request.expression} Qwen fallback succeeded`,
      );
      return qwenResult;
    }

    console.warn(
      `[Production] Expression ${request.expression} Qwen failed: ${qwenResult.error ?? "unknown"}, falling back to Doubao`,
    );
    const doubaoResult = await this.doubao.generateExpression(request);
    if (doubaoResult.status === "completed") {
      console.log(
        `[Production] Expression ${request.expression} Doubao fallback succeeded`,
      );
    } else {
      console.error(
        `[Production] Expression ${request.expression} all three models failed`,
      );
    }
    return doubaoResult;
  }
}
