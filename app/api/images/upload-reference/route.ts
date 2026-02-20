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
  generateReferenceKey,
  uploadImageToR2,
  validateImage,
} from "@/lib/services/storage";

/**
 * POST /api/images/upload-reference
 *
 * Upload a reference image file to R2 storage.
 * Used for avatar generation reference images (image/style/face).
 *
 * Auth: Required
 * Content-Type: multipart/form-data
 * Body: { file: File }
 * Max file size: 2MB
 * Supported formats: PNG, JPG, JPEG, WEBP
 *
 * Response: { url: string, key: string, width: number, height: number }
 */

// Validation schema for form data
const uploadSchema = z.object({
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

    // 3. Validate metadata (optional filename only)
    const metadata = {
      filename: (formData.get("filename") as string) || undefined,
    };

    const parseResult = uploadSchema.safeParse(metadata);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid metadata", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const { filename } = parseResult.data;

    // 4. Validate file type - only allow major image formats
    const allowedMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.",
        },
        { status: 400 },
      );
    }

    // 4.5 Validate file size - max 2MB
    const MAX_SIZE_MB = 2;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size too large. Maximum ${MAX_SIZE_MB}MB allowed.` },
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

    // 7. Generate R2 key for reference image
    const key = generateReferenceKey(session.user.id, filename || "reference");

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
    console.error("[Upload Reference] Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}
