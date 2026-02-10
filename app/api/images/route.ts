import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { ImageType } from "@/lib/services/image";
import { getUserImages } from "@/lib/services/storage";

export async function GET(request: NextRequest) {
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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get("type");

    // 验证 type 参数
    let type: ImageType | undefined;
    if (typeParam) {
      const validTypes: ImageType[] = ["uploads", "thumbnails", "avatars"];
      if (!validTypes.includes(typeParam as ImageType)) {
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 },
        );
      }
      type = typeParam as ImageType;
    }

    // 获取用户图片列表
    const images = await getUserImages(session.user.id, type);

    // 格式化返回数据
    const formattedImages = images.map((image) => ({
      id: image.id,
      type: image.type,
      filename: image.filename,
      originalName: image.originalName,
      url: image.r2Url,
      size: image.size,
      width: image.width,
      height: image.height,
      mimeType: image.mimeType,
      createdAt: image.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        images: formattedImages,
        total: formattedImages.length,
      },
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}
