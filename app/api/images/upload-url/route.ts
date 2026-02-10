import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMimeTypeFromFilename, IMAGE_CONFIG } from "@/lib/services/image";
import { generateFileKey, generatePresignedUploadUrl } from "@/lib/services/r2";

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { filename, type, contentType: providedContentType } = body;

    // 验证必填字段
    if (!filename || !type) {
      return NextResponse.json(
        { error: "Missing required fields: filename and type" },
        { status: 400 },
      );
    }

    // 验证图片类型
    const validTypes = ["uploads", "thumbnails", "avatars"] as const;
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: "Invalid image type. Must be: uploads, thumbnails, or avatars",
        },
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

    // 生成 R2 文件路径
    const key = generateFileKey(session.user.id, type);

    // 生成 Presigned URL (5 分钟有效期)
    const presignedUrl = await generatePresignedUploadUrl(
      key,
      contentType,
      300, // 5 分钟
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
