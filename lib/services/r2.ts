import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 配置
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "thumbfree";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// 验证环境变量
if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error(
    "Missing R2 configuration. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.",
  );
}

// 创建 S3 客户端 (R2 兼容 S3 API)
export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const bucketName = R2_BUCKET_NAME;

/**
 * 生成上传用的 Presigned URL
 * @param key - 文件在 R2 中的路径
 * @param contentType - 文件 MIME 类型
 * @param expiresIn - URL 有效期（秒），默认 300 秒（5 分钟）
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * 删除 R2 中的对象
 * @param key - 文件路径
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * 获取文件的公开访问 URL
 * @param key - 文件路径
 * @returns 完整的公开 URL
 */
export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    // 使用自定义域名
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // 使用 R2.dev 子域名
  return `${R2_ENDPOINT}/${bucketName}/${key}`;
}

/**
 * 生成唯一的文件 key
 * @param userId - 用户 ID
 * @param type - 图片类型 (uploads, thumbnails, avatars)
 * @param extension - 文件扩展名
 * @returns 完整的文件路径
 */
export function generateFileKey(
  userId: string,
  type: "uploads" | "thumbnails" | "avatars",
  extension = "webp",
): string {
  const uuid = crypto.randomUUID();

  if (type === "avatars") {
    return `${type}/${userId}.${extension}`;
  }

  return `${type}/${userId}/${uuid}.${extension}`;
}
