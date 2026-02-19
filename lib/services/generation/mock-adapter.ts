import type {
  GenerateCharacterRequest,
  GenerateCharacterResult,
  GenerateExpressionRequest,
  GenerateExpressionResult,
  GenerationAdapter,
} from "./types";

/**
 * Mock generation adapter for development.
 * Returns placeholder images after a simulated delay.
 *
 * Set GENERATION_ADAPTER=mock in .env to use this.
 */

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

const MOCK_CHARACTER_IMAGES = [
  "/images/showcase/1.WEBP",
  "/images/showcase/2.WEBP",
  "/images/showcase/3.WEBP",
  "/images/showcase/4.WEBP",
  "/images/showcase/5.WEBP",
  "/images/showcase/6.WEBP",
  "/images/showcase/7.WEBP",
  "/images/showcase/8.WEBP",
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp as T;
  }
  return shuffled;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAdapter implements GenerationAdapter {
  async generateCharacter(
    _request: GenerateCharacterRequest,
  ): Promise<GenerateCharacterResult> {
    // Simulate Midjourney generation time (3-5 seconds)
    await delay(2000 + Math.random() * 3000);

    // Return 4 random images from our showcase
    const candidates = shuffle(MOCK_CHARACTER_IMAGES).slice(0, 4);
    const baseUrl = getBaseUrl();

    return {
      status: "completed",
      images: candidates.map((img) => `${baseUrl}${img}`),
    };
  }

  async generateExpression(
    _request: GenerateExpressionRequest,
  ): Promise<GenerateExpressionResult> {
    // Simulate Nano Banana edit time (1-3 seconds per expression)
    await delay(1000 + Math.random() * 2000);

    // In mock mode, return a random showcase image as the "edited" expression
    const mockImages = shuffle(MOCK_CHARACTER_IMAGES);
    const baseUrl = getBaseUrl();

    return {
      status: "completed",
      imageUrl: `${baseUrl}${mockImages[0] ?? "/images/showcase/1.WEBP"}`,
    };
  }
}
