import { type NextRequest, NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/services/r2";

// For public uploads, we don't create a database record
// Just return the public URL directly

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, filename, width, height, mimeType, size } = body;

    // 验证必填字段
    if (!key || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 验证 key 格式 (防止路径遍历攻击)
    const validKeyPattern = /^(uploads)\/[a-zA-Z0-9-_/]+\.[a-zA-Z0-9]+$/;
    if (!validKeyPattern.test(key)) {
      return NextResponse.json(
        { error: "Invalid key format" },
        { status: 400 },
      );
    }

    // Get the public URL directly from R2
    const url = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      data: {
        image: {
          id: key, // Use key as ID for anonymous uploads
          type: "uploads" as const,
          filename: filename || key.split("/").pop(),
          originalName: null,
          url,
          size: size || 0,
          width: width || 0,
          height: height || 0,
          createdAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error confirming public upload:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 },
    );
  }
}
