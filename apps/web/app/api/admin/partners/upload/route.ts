import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { isR2Configured } from "@/lib/services/r2";
import { uploadImageToR2, validateImage } from "@/lib/services/storage";

/**
 * POST /api/admin/partners/upload
 *
 * Upload a partner logo to R2 storage.
 *
 * Auth: Required (Admin only)
 * Content-Type: multipart/form-data
 * Body: { file: File }
 * Max file size: 2MB
 * Supported formats: PNG, JPG, WEBP, SVG
 *
 * Response: { url: string, key: string }
 */

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Admin check
  if (!isAdmin(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Check R2 configuration
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 storage not configured" },
      { status: 503 },
    );
  }

  try {
    // 4. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 5. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: `Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 6. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    // 7. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 8. Validate image (skip for SVG)
    if (file.type !== "image/svg+xml") {
      try {
        await validateImage(buffer);
      } catch (error) {
        return NextResponse.json(
          {
            error: "Image validation failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 400 },
        );
      }
    }

    // 9. Generate R2 key for partner logo
    const extension = file.type === "image/svg+xml" ? "svg" : "png";
    const key = `partners/logos/${crypto.randomUUID()}.${extension}`;

    // 10. Upload to R2
    const url = await uploadImageToR2(buffer, key, file.type);

    // 11. Return response
    return NextResponse.json({
      url,
      key,
    });
  } catch (error: unknown) {
    console.error("[Partner Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}
