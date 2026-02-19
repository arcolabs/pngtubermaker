/**
 * Production generation adapter.
 *
 * Composes two specialized adapters:
 * - MidjourneyAdapter → character generation (4 candidates via Niji 7)
 * - NanoBananaAdapter → expression generation (1 image via text prompt)
 *
 * Set GENERATION_ADAPTER=production to use this.
 */

import { MidjourneyAdapter } from "./midjourney-adapter";
import { NanoBananaAdapter } from "./nano-banana-adapter";
import type {
  GenerateCharacterRequest,
  GenerateCharacterResult,
  GenerateExpressionRequest,
  GenerateExpressionResult,
  GenerationAdapter,
} from "./types";

export class ProductionAdapter implements GenerationAdapter {
  private midjourney = new MidjourneyAdapter();
  private nanoBanana = new NanoBananaAdapter();

  async generateCharacter(
    request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    return this.midjourney.generateCharacter(request);
  }

  async generateExpression(
    request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    return this.nanoBanana.generateExpression(request);
  }
}
