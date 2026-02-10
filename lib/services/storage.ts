import { and, desc, eq } from "drizzle-orm";
import { generatedThumbnails, images } from "@/database/schema";
import { db } from "@/lib/db";
import type { ImageMetadata, ImageType } from "./image";
import { deleteObject, getPublicUrl } from "./r2";

/**
 * 创建图片记录
 * @param userId - 用户 ID
 * @param type - 图片类型
 * @param filename - 文件名
 * @param originalName - 原始文件名
 * @param metadata - 图片元数据
 * @param r2Key - R2 中的路径
 * @returns 创建的图片记录
 */
export async function createImageRecord(
  userId: string,
  type: ImageType,
  filename: string,
  originalName: string | null,
  metadata: ImageMetadata,
  r2Key: string,
) {
  const id = crypto.randomUUID();
  const r2Url = getPublicUrl(r2Key);

  const [image] = await db
    .insert(images)
    .values({
      id,
      userId,
      type,
      filename,
      originalName,
      mimeType: metadata.mimeType,
      size: metadata.size.toString(),
      width: metadata.width.toString(),
      height: metadata.height.toString(),
      r2Key,
      r2Url,
    })
    .returning();

  return image;
}

/**
 * 获取用户的图片列表
 * @param userId - 用户 ID
 * @param type - 可选的类型过滤
 * @returns 图片列表
 */
export async function getUserImages(userId: string, type?: ImageType) {
  const conditions = [eq(images.userId, userId)];

  if (type) {
    conditions.push(eq(images.type, type));
  }

  return await db
    .select()
    .from(images)
    .where(and(...conditions))
    .orderBy(desc(images.createdAt));
}

/**
 * 根据 ID 获取图片
 * @param id - 图片 ID
 * @param userId - 用户 ID（用于权限验证）
 * @returns 图片记录或 null
 */
export async function getImageById(id: string, userId: string) {
  const [image] = await db
    .select()
    .from(images)
    .where(and(eq(images.id, id), eq(images.userId, userId)));

  return image || null;
}

/**
 * 删除图片（数据库 + R2）
 * @param id - 图片 ID
 * @param userId - 用户 ID（用于权限验证）
 * @returns 是否删除成功
 */
export async function deleteImage(
  id: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  // 获取图片记录
  const image = await getImageById(id, userId);

  if (!image) {
    return { success: false, error: "Image not found" };
  }

  try {
    // 从 R2 删除文件
    await deleteObject(image.r2Key);

    // 从数据库删除记录
    await db
      .delete(images)
      .where(and(eq(images.id, id), eq(images.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

/**
 * 创建缩略图生成记录
 * @param userId - 用户 ID
 * @param sourceImageId - 源图片 ID
 * @param prompt - AI 提示词
 * @returns 创建的记录
 */
export async function createThumbnailGenerationRecord(
  userId: string,
  sourceImageId: string,
  prompt?: string,
) {
  const id = crypto.randomUUID();

  const [record] = await db
    .insert(generatedThumbnails)
    .values({
      id,
      userId,
      sourceImageId,
      prompt,
      status: "pending",
    })
    .returning();

  return record;
}

/**
 * 更新缩略图生成状态
 * @param id - 记录 ID
 * @param status - 新状态
 * @param resultImageId - 生成的图片 ID（可选）
 * @returns 更新后的记录
 */
export async function updateThumbnailGenerationStatus(
  id: string,
  status: "pending" | "completed" | "failed",
  resultImageId?: string,
) {
  const [record] = await db
    .update(generatedThumbnails)
    .set({
      status,
      resultImageId,
    })
    .where(eq(generatedThumbnails.id, id))
    .returning();

  return record;
}
