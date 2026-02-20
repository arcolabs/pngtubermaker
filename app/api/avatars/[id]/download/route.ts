import archiver from "archiver";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { avatarExpressions, avatars, subscriptions } from "@/database/schema";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { resizeImage } from "@/lib/services/storage";

/**
 * GET /api/avatars/[id]/download?format=zip&size=1080
 *
 * Download avatar as PNG (single base image) or ZIP (base + expressions).
 *
 * Auth: Required (must own avatar)
 * Query:
 *   - format: 'png' | 'zip' (default: 'png')
 *   - size: optional, auto-determined by subscription tier if omitted
 *
 * Tier restrictions:
 *   - Free: max 512, watermarked
 *   - Start: max 1080
 *   - Pro: max 2160
 *
 * Response:
 *   - format=png: single image/png binary (base image only)
 *   - format=zip: application/zip stream (base + all expressions)
 */

const MAX_DIMENSION = 2160;

// Size limits by tier
const TIER_SIZE_LIMITS = {
  free: 512,
  start: 1080,
  pro: 2160,
} as const;

type Tier = keyof typeof TIER_SIZE_LIMITS;

const downloadSchema = z.object({
  format: z.enum(["png", "zip"]).default("png"),
  size: z.coerce.number().int().min(512).max(MAX_DIMENSION).optional(),
});

/**
 * Get user's current subscription tier
 * Returns 'free' if no active subscription
 */
async function getUserTier(userId: string): Promise<Tier> {
  const db = getDatabase();

  const sub = await db
    .select({ tier: subscriptions.tier })
    .from(subscriptions)
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")),
    )
    .limit(1);

  if (sub.length > 0 && sub[0]?.tier) {
    return sub[0].tier as Tier;
  }

  return "free";
}

/**
 * Apply watermark to image buffer (Free tier)
 * Uses sharp to composite a semi-transparent text watermark at the bottom
 */
async function applyWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width || 512;
  const height = metadata.height || 512;

  // Create a text watermark SVG overlay
  const fontSize = Math.max(Math.round(width * 0.06), 16);
  const watermarkSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .watermark {
          fill: rgba(255, 255, 255, 0.35);
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
          font-weight: bold;
        }
      </style>
      <text x="50%" y="92%" text-anchor="middle" class="watermark">PNGTuberMaker</text>
    </svg>
  `);

  return image
    .composite([{ input: watermarkSvg, gravity: "south" }])
    .png()
    .toBuffer();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: avatarId } = await params;

  // 2. Parse query parameters
  const { searchParams } = new URL(req.url);
  const parseResult = downloadSchema.safeParse({
    format: searchParams.get("format") || undefined,
    size: searchParams.get("size") || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parseResult.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { format, size: requestedSize } = parseResult.data;

  // 3. Fetch avatar and verify ownership
  const db = getDatabase();
  const avatar = await db
    .select()
    .from(avatars)
    .where(and(eq(avatars.id, avatarId), eq(avatars.userId, session.user.id)))
    .limit(1);

  if (avatar.length === 0) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  const a = avatar[0];

  // 4. Verify avatar has base image
  if (!a.baseImageUrl) {
    return NextResponse.json(
      { error: "Avatar has no images to download" },
      { status: 400 },
    );
  }

  // 5. Determine size from tier (auto if not specified, capped to tier max)
  const tier = await getUserTier(session.user.id);
  const maxSize = TIER_SIZE_LIMITS[tier];
  const size = requestedSize ? Math.min(requestedSize, maxSize) : maxSize;

  // 6. Fetch all expressions
  const expressions = await db
    .select()
    .from(avatarExpressions)
    .where(
      and(
        eq(avatarExpressions.avatarId, avatarId),
        eq(avatarExpressions.status, "completed"),
      ),
    );

  // 7. Collect all images to download
  const files: { name: string; url: string }[] = [
    {
      name: `${a.name}_idle.png`,
      url: a.baseImageUrl,
    },
  ];

  for (const expr of expressions) {
    // Skip idle expressions — base image is already included as {name}_idle.png
    if (expr.type === "idle") continue;
    if (expr.imageUrl) {
      files.push({
        name: `${a.name}_${expr.type}.png`,
        url: expr.imageUrl,
      });
    }
  }

  // 8. Process images (resize, watermark)
  const processedFiles: {
    name: string;
    buffer: Buffer;
    originalUrl: string;
  }[] = [];

  for (const file of files) {
    try {
      // Fetch image from R2
      const imageResponse = await fetch(file.url);
      if (!imageResponse.ok) {
        console.error(
          `[Download] Failed to fetch ${file.name}: ${imageResponse.status}`,
        );
        continue;
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      let buffer: Buffer = Buffer.from(arrayBuffer);

      // Resize if needed
      buffer = await resizeImage(buffer, size, size);

      // Apply watermark for Free tier
      if (tier === "free") {
        buffer = await applyWatermark(buffer);
      }

      processedFiles.push({
        name: file.name,
        buffer,
        originalUrl: file.url,
      });
    } catch (error) {
      console.error(`[Download] Failed to process ${file.name}:`, error);
    }
  }

  if (processedFiles.length === 0) {
    return NextResponse.json(
      { error: "Failed to process any images" },
      { status: 500 },
    );
  }

  // 9. Return based on format
  if (format === "png") {
    // Single PNG: return just the base image (first processed file)
    const base = processedFiles[0];
    return new NextResponse(new Uint8Array(base.buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${base.name}"`,
        "Content-Length": base.buffer.length.toString(),
      },
    });
  }

  // ZIP: bundle base + all expressions
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk) => chunks.push(chunk));

  for (const file of processedFiles) {
    archive.append(file.buffer, { name: file.name });
  }

  await archive.finalize();
  const zipBuffer = Buffer.concat(chunks);

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${a.name}_pngtuber.zip"`,
      "Content-Length": zipBuffer.length.toString(),
    },
  });
}
