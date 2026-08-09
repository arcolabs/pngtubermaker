import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/proxy-image?url=<image-url>
 *
 * Proxies external images to bypass CORS restrictions.
 * Used by PNGTuberPreview canvas which requires CORS-enabled images.
 *
 * Auth: Required (to prevent abuse)
 * Query: { url: string }
 *
 * Returns: Image binary with proper content-type
 */

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get URL from query params
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  // 3. Validate URL (must be from our CDN)
  const allowedDomains = [
    "cdn.pngtubermaker.com",
    "pngtubermaker.com",
    "localhost",
  ];

  try {
    const urlObj = new URL(imageUrl);
    const isAllowed = allowedDomains.some(
      (domain) =>
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`),
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // 4. Fetch the image from external source
    const imageResponse = await fetch(imageUrl, {
      headers: {
        // Pass through some headers if needed
        Accept: "image/*",
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status}` },
        { status: imageResponse.status },
      );
    }

    // 5. Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/png";

    // 6. Return with CORS headers enabled
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("[Proxy Image] Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 },
    );
  }
}
