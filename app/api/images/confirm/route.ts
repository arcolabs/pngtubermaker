import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { ImageType } from "@/lib/services/image";
import { createImageRecord } from "@/lib/services/storage";

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
    const { key, filename, originalName, type, size, width, height, mimeType } =
      body;

    // 验证必填字段
    if (!key || !filename || !type || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 验证 key 格式 (防止路径遍历攻击)
    const validKeyPattern =
      /^(uploads|thumbnails|avatars)\/[a-zA-Z0-9-_/]+\.[a-zA-Z0-9]+$/;
    if (!validKeyPattern.test(key)) {
      return NextResponse.json(
        { error: "Invalid key format" },
        { status: 400 },
      );
    }

    // 验证图片类型
    const validTypes: ImageType[] = ["uploads", "thumbnails", "avatars"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 },
      );
    }

    // 构建元数据
    const metadata = {
      width: width || 0,
      height: height || 0,
      size: size || 0,
      format: mimeType.split("/")[1] || "webp",
      mimeType,
    };

    // 保存图片记录到数据库
    const image = await createImageRecord(
      session.user.id,
      type,
      filename,
      originalName || null,
      metadata,
      key,
    );

    return NextResponse.json({
      success: true,
      data: {
        image: {
          id: image.id,
          type: image.type,
          filename: image.filename,
          originalName: image.originalName,
          url: image.r2Url,
          size: image.size,
          width: image.width,
          height: image.height,
          createdAt: image.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error confirming image upload:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 },
    );
  }
}
