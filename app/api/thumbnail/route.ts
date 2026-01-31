import { NextRequest, NextResponse } from "next/server";

// YouTube URL patterns to extract Video ID
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
];

// Thumbnail sizes in order of preference (highest to lowest)
const THUMBNAIL_SIZES = [
  { name: "maxresdefault", label: "HD Image", resolution: "1280x720", quality: "highest" },
  { name: "hqdefault", label: "HQ Image", resolution: "480x360", quality: "high" },
  { name: "sddefault", label: "SD Image", resolution: "640x480", quality: "medium" },
  { name: "mqdefault", label: "MQ Image", resolution: "320x180", quality: "low" },
];

function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function checkThumbnailExists(videoId: string, size: string): Promise<boolean> {
  const url = `https://img.youtube.com/vi/${videoId}/${size}.jpg`;
  try {
    const response = await fetch(url, { method: "HEAD" });
    // YouTube returns 404 for non-existent thumbnails
    // But also check content-type to ensure it's an image
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      return contentType?.startsWith("image/") ?? false;
    }
    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    return NextResponse.json(
      { error: "Invalid YouTube URL. Please enter a valid YouTube video URL." },
      { status: 400 }
    );
  }

  // Check which thumbnail sizes are available
  const availableThumbnails = await Promise.all(
    THUMBNAIL_SIZES.map(async (size) => {
      const exists = await checkThumbnailExists(videoId, size.name);
      if (exists) {
        return {
          ...size,
          url: `https://img.youtube.com/vi/${videoId}/${size.name}.jpg`,
          videoId,
        };
      }
      return null;
    })
  );

  // Filter out null values and return
  const results = availableThumbnails.filter((t) => t !== null);

  if (results.length === 0) {
    return NextResponse.json(
      { error: "No thumbnails found for this video. It may be private or deleted." },
      { status: 404 }
    );
  }

  return NextResponse.json({ thumbnails: results });
}
