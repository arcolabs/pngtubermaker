import { type NextRequest, NextResponse } from "next/server";
import { getMimeTypeFromFilename, IMAGE_CONFIG } from "@/lib/services/image";
import { generateFileKey, generatePresignedUploadUrl } from "@/lib/services/r2";

// Anonymous user ID for public uploads
const ANONYMOUS_USER_ID = "anonymous";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType: providedContentType } = body;

    // 验证必填字段
    if (!filename) {
      return NextResponse.json(
        { error: "Missing required field: filename" },
        { status: 400 },
      );
    }

    // 确定 MIME 类型
    const contentType =
      providedContentType || getMimeTypeFromFilename(filename);

    // 验证 MIME 类型
    if (!IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${IMAGE_CONFIG.ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 生成 R2 文件路径 (使用匿名用户 ID)
    const key = generateFileKey(ANONYMOUS_USER_ID, "uploads");

    // 生成 Presigned URL (5 分钟有效期)
    const presignedUrl = await generatePresignedUploadUrl(
      key,
      contentType,
      300,
    );

    // 返回上传所需信息
    return NextResponse.json({
      success: true,
      data: {
        presignedUrl,
        key,
        expiresAt: new Date(Date.now() + 300 * 1000).toISOString(),
        contentType,
        maxFileSize: IMAGE_CONFIG.MAX_FILE_SIZE,
      },
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
