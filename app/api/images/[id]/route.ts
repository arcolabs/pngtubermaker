import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteImage } from "@/lib/services/storage";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    // 获取图片 ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 },
      );
    }

    // 删除图片
    const result = await deleteImage(id, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete image" },
        { status: result.error === "Image not found" ? 404 : 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
