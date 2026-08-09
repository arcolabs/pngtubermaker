import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createRateLimitHeaders,
  getRateLimitIdentifier,
  uploadLimiter,
} from "@/lib/middleware/rate-limit";
import {
  generateAvatarKey,
  uploadImageToR2,
  validateImage,
} from "@/lib/services/storage";

/**
 * POST /api/images/upload
 *
 * Upload an image file to R2 storage.
 *
 * Auth: Required
 * Content-Type: multipart/form-data
 * Body: { file: File, type: 'avatar' | 'expression', avatarId?: string }
 * Max file size: 10MB
 * Supported formats: PNG (with transparency support)
 *
 * Response: { url: string, key: string, width: number, height: number }
 */

// Validation schema for form data
const uploadSchema = z.object({
  type: z.enum(["candidate", "base", "thumbnail", "expression"]),
  avatarId: z.string().uuid(),
  filename: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1.5. Rate limit check
  const identifier = getRateLimitIdentifier(req, session.user.id);
  const rateLimitResult = uploadLimiter.check(identifier);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: "Too many upload requests. Please try again later.",
        reset: rateLimitResult.reset,
      },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      },
    );
  }

  try {
    // 2. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate metadata
    const metadata = {
      type: formData.get("type") as string,
      avatarId: formData.get("avatarId") as string,
      filename: (formData.get("filename") as string) || undefined,
    };

    const parseResult = uploadSchema.safeParse(metadata);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid metadata", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { type, avatarId, filename } = parseResult.data;

    // 4. Validate file type (must be PNG for transparency)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 },
      );
    }

    // 5. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Validate image (dimensions, size)
    let imageInfo: {
      width: number;
      height: number;
      format: string;
      hasAlpha: boolean;
    };
    try {
      imageInfo = await validateImage(buffer);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Image validation failed",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }

    // 7. Generate R2 key
    const key = generateAvatarKey(
      session.user.id,
      avatarId,
      type,
      filename || "image",
    );

    // 8. Upload to R2
    const url = await uploadImageToR2(buffer, key, file.type);

    // 9. Return response
    return NextResponse.json({
      url,
      key,
      width: imageInfo.width,
      height: imageInfo.height,
      format: imageInfo.format,
      hasAlpha: imageInfo.hasAlpha,
    });
  } catch (error: unknown) {
    console.error("[Upload] Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}
