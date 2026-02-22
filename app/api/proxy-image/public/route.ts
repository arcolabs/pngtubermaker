import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * GET /api/proxy-image/public?url=<image-url>
 *
 * Public (unauthenticated) image proxy for the OBS Browser Source player.
 * Bypasses CORS restrictions so the PNGTuber engine canvas can draw CDN images.
 *
 * Security: Only proxies images from our own CDN domain — not an open proxy.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  // Only allow our own CDN domains
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
    const imageResponse = await fetch(imageUrl, {
      headers: { Accept: "image/*" },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status}` },
        { status: imageResponse.status },
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/png";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, max-age=86400", // 24h — expression images don't change
      },
    });
  } catch (error) {
    console.error("[Public Proxy Image] Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 },
    );
  }
}
