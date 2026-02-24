/**
 * Production generation adapter.
 *
 * Uses only Qwen + Doubao Seedream for all generation tasks.
 *
 * Character generation: 2×Qwen + 2×Doubao in parallel, failed calls
 * are retried once with Doubao to ensure 4 candidate images.
 *
 * Expression generation: Qwen first, Doubao fallback on failure.
 * Callers handle staggered concurrency to avoid PiAPI rate limits.
 *
 * Set GENERATION_ADAPTER=production to use this.
 */

import { DoubaoSeedreamAdapter } from "./doubao-seedream-adapter";
import { QwenAdapter } from "./qwen-adapter";
import type {
  GenerateCharacterRequest,
  GenerateCharacterResult,
  GenerateExpressionRequest,
  GenerateExpressionResult,
  GenerationAdapter,
} from "./types";

interface ModelGenerator {
  name: string;
  generate: (request: GenerateCharacterRequest) => Promise<string | null>;
}

export class ProductionAdapter implements GenerationAdapter {
  private qwen = new QwenAdapter();
  private doubao = new DoubaoSeedreamAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    // Phase 1: 2×Qwen + 2×Doubao in parallel
    const generators: ModelGenerator[] = [
      {
        name: "Qwen-1",
        generate: (req) => this.qwen.generateCharacterImage(req),
      },
      {
        name: "Qwen-2",
        generate: (req) => this.qwen.generateCharacterImage(req),
      },
      {
        name: "Doubao-1",
        generate: (req) => this.doubao.generateCharacterImage(req),
      },
      {
        name: "Doubao-2",
        generate: (req) => this.doubao.generateCharacterImage(req),
      },
    ];

    console.log(
      `[Production] Phase 1: character generation (2×Qwen + 2×Doubao)`,
    );

    const results = await Promise.allSettled(
      generators.map((g) => g.generate(request)),
    );

    const images: string[] = [];
    let failedCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const name = generators[i]?.name ?? `Model${i}`;

      if (result?.status === "fulfilled" && result.value) {
        images.push(result.value);
        console.log(`[Production] ${name}: success`);
      } else {
        const reason =
          result?.status === "rejected" ? result.reason : "No image returned";
        console.warn(`[Production] ${name}: failed -`, reason);
        failedCount++;
      }
    }

    // Phase 2: Retry failed calls with Doubao to fill up to 4 images
    if (failedCount > 0) {
      console.log(
        `[Production] Phase 2: retrying ${failedCount} failed call(s) with Doubao`,
      );

      const retryGenerators: ModelGenerator[] = Array.from(
        { length: failedCount },
        (_, i) => ({
          name: `Doubao-Retry-${i + 1}`,
          generate: (req: GenerateCharacterRequest) =>
            this.doubao.generateCharacterImage(req),
        }),
      );

      const retryResults = await Promise.allSettled(
        retryGenerators.map((g) => g.generate(request)),
      );

      for (let i = 0; i < retryResults.length; i++) {
        const result = retryResults[i];
        const name = retryGenerators[i]?.name ?? `Retry${i}`;

        if (result?.status === "fulfilled" && result.value) {
          images.push(result.value);
          console.log(`[Production] ${name}: success`);
        } else {
          const reason =
            result?.status === "rejected" ? result.reason : "No image returned";
          console.warn(`[Production] ${name}: failed -`, reason);
        }
      }
    }

    if (images.length === 0) {
      return {
        status: "failed",
        images: [],
        error: "All models failed to generate (including retries)",
      };
    }

    console.log(
      `[Production] Final: ${images.length}/4 images (${failedCount > 0 ? `${failedCount} retried` : "no retries needed"})`,
    );
    return { status: "completed", images };
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    console.log(`[Production] Expression ${request.expression} → Qwen`);
    const qwenResult = await this.qwen.generateExpression(request);

    if (qwenResult.status === "completed") return qwenResult;

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
        `[Production] Expression ${request.expression} both Qwen and Doubao failed`,
      );
    }

    return doubaoResult;
  }
}
