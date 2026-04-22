import { MockAdapter } from "./mock-adapter";
import { ProductionAdapter } from "./production-adapter";
import type { GenerationAdapter } from "./types";

export type { GenerationAdapter } from "./types";
export {
  type ArtStyle,
  BASE_EXPRESSIONS,
  CUSTOM_EXPRESSIONS,
  EXPRESSION_TYPES,
  type ExpressionType,
  type GenerateCharacterRequest,
  type GenerateCharacterResult,
  type GenerateExpressionRequest,
  type GenerateExpressionResult,
} from "./types";

let _adapter: GenerationAdapter | undefined;

/**
 * Get the generation adapter based on environment configuration.
 *
 * GENERATION_ADAPTER=mock       → MockAdapter (development)
 * GENERATION_ADAPTER=production → Production adapters (GPT-Image-2 primary, Qwen + Doubao fallback)
 *
 * Default: mock
 */
export function getGenerationAdapter(): GenerationAdapter {
  if (_adapter) return _adapter;

  const adapterType = process.env.GENERATION_ADAPTER || "mock";

  if (adapterType === "production") {
    _adapter = new ProductionAdapter();
    return _adapter;
  }

  _adapter = new MockAdapter();
  return _adapter;
}
