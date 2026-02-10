import sharp from "sharp";

// 图片配置常量
export const IMAGE_CONFIG = {
  // 原始文件大小限制：10MB
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  // 压缩后目标大小：2MB
  TARGET_FILE_SIZE: 2 * 1024 * 1024,
  // 支持的 MIME 类型
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as string[],
  // 压缩质量
  COMPRESSION_QUALITY: 80,
  // 最大宽度（防止超大图片）
  MAX_WIDTH: 4096,
  // 最大高度
  MAX_HEIGHT: 4096,
} as const;

// 图片类型
export type ImageType = "uploads" | "thumbnails" | "avatars";

// 图片元数据接口
export interface ImageMetadata {
  width: number;
  height: number;
  size: number; // bytes
  format: string;
  mimeType: string;
}

/**
 * 验证图片文件
 * @param buffer - 文件 Buffer
 * @param mimeType - 声明的 MIME 类型
 * @returns 验证结果
 */
export async function validateImage(
  buffer: Buffer,
  mimeType: string,
): Promise<{ valid: boolean; error?: string }> {
  // 检查文件大小
  if (buffer.length > IMAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size too large. Maximum allowed is ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // 检查 MIME 类型
  if (!IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${IMAGE_CONFIG.ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  try {
    // 尝试解析图片获取真实格式
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      return {
        valid: false,
        error: "Invalid image file",
      };
    }

    return { valid: true };
  } catch (_error) {
    return {
      valid: false,
      error: "Failed to process image. Please ensure it's a valid image file.",
    };
  }
}

/**
 * 处理并压缩图片
 * @param buffer - 原始文件 Buffer
 * @returns 处理后的 Buffer 和元数据
 */
export async function processImage(buffer: Buffer): Promise<{
  buffer: Buffer;
  metadata: ImageMetadata;
}> {
  let image = sharp(buffer);
  const metadata = await image.metadata();

  // 调整尺寸（如果超出限制）
  if (
    metadata.width &&
    metadata.height &&
    (metadata.width > IMAGE_CONFIG.MAX_WIDTH ||
      metadata.height > IMAGE_CONFIG.MAX_HEIGHT)
  ) {
    image = image.resize(IMAGE_CONFIG.MAX_WIDTH, IMAGE_CONFIG.MAX_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // 转换为 WebP 格式并压缩
  let processedBuffer = await image
    .webp({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY })
    .toBuffer();

  // 如果仍然太大，进一步降低质量
  let quality = IMAGE_CONFIG.COMPRESSION_QUALITY;
  while (
    processedBuffer.length > IMAGE_CONFIG.TARGET_FILE_SIZE &&
    quality > 20
  ) {
    quality -= 10;
    processedBuffer = await image.webp({ quality }).toBuffer();
  }

  // 获取最终元数据
  const finalMetadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    metadata: {
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
      size: processedBuffer.length,
      format: "webp",
      mimeType: "image/webp",
    },
  };
}

/**
 * 提取图片元数据（不处理）
 * @param buffer - 文件 Buffer
 * @returns 图片元数据
 */
export async function extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: buffer.length,
    format: metadata.format || "unknown",
    mimeType: `image/${metadata.format || "jpeg"}`,
  };
}

/**
 * 根据类型获取 Content-Type
 * @param filename - 文件名
 * @returns MIME 类型
 */
export function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  return mimeTypes[ext || ""] || "image/webp";
}
