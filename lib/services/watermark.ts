import sharp from "sharp";

/**
 * Overlay "pngtubermaker.com" in the bottom-right corner of an image.
 * Uses an SVG overlay so text rendering is consistent across platforms.
 * Font size scales with image width (~2%), white @ 70% opacity with a subtle shadow.
 */
export async function watermarkImage(input: Buffer): Promise<Buffer> {
  const img = sharp(input);
  const meta = await img.metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  const fontSize = Math.max(14, Math.round(width * 0.02));
  const padX = Math.round(width * 0.02);
  const padY = Math.round(height * 0.02);
  const text = "pngtubermaker.com";

  const svg = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .wm {
          font: 500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          fill: #ffffff;
          fill-opacity: 0.7;
          paint-order: stroke;
          stroke: #000000;
          stroke-opacity: 0.25;
          stroke-width: ${Math.max(1, Math.round(fontSize / 12))}px;
        }
      </style>
      <text x="${width - padX}" y="${height - padY}" text-anchor="end" class="wm">${text}</text>
    </svg>`,
  );

  return img
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toBuffer();
}
