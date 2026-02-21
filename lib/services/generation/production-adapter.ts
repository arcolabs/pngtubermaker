/**
 * Production generation adapter.
 *
 * Character generation: runs multiple models in parallel, each producing 1 image.
 * Expression generation: uses Nano Banana Pro (text-only prompt engineering).
 *
 * Models for character generation:
 * 1. Nano Banana Pro ($0.105/image)
 * 2. Qwen Image ($0.015/image)
 * 3. Gemini 2.5 Flash Image ($0.03/image)
 * 4. Doubao Seedream 4.5 (ByteDance Ark API, synchronous)
 *
 * Set GENERATION_ADAPTER=production to use this.
 */

import { DoubaoSeedreamAdapter } from "./doubao-seedream-adapter";
import { GeminiFlashAdapter } from "./gemini-flash-adapter";
import { NanoBananaAdapter } from "./nano-banana-adapter";
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
  private nanoBanana = new NanoBananaAdapter();
  private qwen = new QwenAdapter();
  private geminiFlash = new GeminiFlashAdapter();
  private doubao = new DoubaoSeedreamAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    const generators: ModelGenerator[] = [
      {
        name: "NanoBanana",
        generate: (req) => this.nanoBanana.generateCharacterImage(req),
      },
      {
        name: "Qwen",
        generate: (req) => this.qwen.generateCharacterImage(req),
      },
      {
        name: "GeminiFlash",
        generate: (req) => this.geminiFlash.generateCharacterImage(req),
      },
      {
        name: "Doubao",
        generate: (req) => this.doubao.generateCharacterImage(req),
      },
    ];

    console.log(
      `[Production] Starting multi-model character generation (${generators.length} models)`,
    );

    const results = await Promise.allSettled(
      generators.map((g) => g.generate(request)),
    );

    const images: string[] = [];
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
      }
    }

    if (images.length === 0) {
      return {
        status: "failed",
        images: [],
        error: "All models failed to generate",
      };
    }

    console.log(
      `[Production] ${images.length}/${generators.length} models succeeded`,
    );
    return { status: "completed", images };
  }

  private expressionIndex = 0;

  /**
   * Generate expression using round-robin across 3 image-edit capable models.
   * Each call rotates to the next model: NanoBanana → Qwen → Doubao → ...
   */
  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    const adapters = [
      { name: "NanoBanana", adapter: this.nanoBanana },
      { name: "Qwen", adapter: this.qwen },
      { name: "Doubao", adapter: this.doubao },
    ];
    const pick = adapters[this.expressionIndex % adapters.length];
    this.expressionIndex++;

    console.log(
      `[Production] Expression ${request.expression} → ${pick.name}`,
    );
    return pick.adapter.generateExpression(request);
  }
}
