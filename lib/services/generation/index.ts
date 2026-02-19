import { MockAdapter } from "./mock-adapter";
import type { GenerationAdapter } from "./types";

export type { GenerationAdapter } from "./types";
export {
  type ArtStyle,
  EXPRESSION_TYPES,
  type ExpressionType,
  type GenerateCharacterRequest,
  type GenerateCharacterResult,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
  MVP_EXPRESSIONS,
} from "./types";

let _adapter: GenerationAdapter | undefined;

/**
 * Get the generation adapter based on environment configuration.
 *
 * GENERATION_ADAPTER=mock       → MockAdapter (development)
 * GENERATION_ADAPTER=production → Production adapters (Midjourney + Nano Banana)
 *
 * Default: mock
 */
export function getGenerationAdapter(): GenerationAdapter {
  if (_adapter) return _adapter;

  const adapterType = process.env.GENERATION_ADAPTER || "mock";

  if (adapterType === "production") {
    // TODO: Implement production adapter when API docs are provided
    // Will combine MidjourneyAdapter (character) + NanoBananaAdapter (expressions)
    throw new Error(
      "Production adapter not yet implemented. Set GENERATION_ADAPTER=mock for development.",
    );
  }

  _adapter = new MockAdapter();
  return _adapter;
}
