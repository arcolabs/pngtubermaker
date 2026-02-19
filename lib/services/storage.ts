import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "my-bucket";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new Error(
        "Missing R2 configuration. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.",
      );
    }
    r2Client = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2Client;
}

export const bucketName = R2_BUCKET_NAME;

export function isR2Configured(): boolean {
  return !!(R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

/**
 * Generate a presigned URL for client-side uploads (if needed)
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

  return await getSignedUrl(getR2Client(), command, { expiresIn });
}

/**
 * Delete an object from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await getR2Client().send(command);
  } catch (error) {
    console.error(`[Storage] Failed to delete object ${key}:`, error);
    // Don't throw - deletion failures shouldn't block other operations
  }
}

/**
 * Get public URL for an R2 key
 */
export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    const publicUrl = R2_PUBLIC_URL.startsWith("http")
      ? R2_PUBLIC_URL
      : `https://${R2_PUBLIC_URL}`;
    return `${publicUrl}/${key}`;
  }
  return `${R2_ENDPOINT}/${bucketName}/${key}`;
}

/**
 * Generate avatar-related file keys
 */
export function generateAvatarKey(
  userId: string,
  avatarId: string,
  type: "candidate" | "base" | "thumbnail" | "expression",
  filename?: string,
): string {
  switch (type) {
    case "candidate":
      return `avatars/${userId}/${avatarId}/candidates/${filename}.png`;
    case "base":
      return `avatars/${userId}/${avatarId}/base.png`;
    case "thumbnail":
      return `avatars/${userId}/${avatarId}/thumbnail.png`;
    case "expression":
      return `avatars/${userId}/${avatarId}/expressions/${filename}.png`;
    default:
      throw new Error(`Unknown key type: ${type}`);
  }
}

/**
 * Upload image buffer to R2
 * Returns the public URL
 */
export async function uploadImageToR2(
  buffer: Buffer,
  key: string,
  contentType = "image/png",
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await getR2Client().send(command);
  return getPublicUrl(key);
}

/**
 * Resize image using sharp
 * Maintains aspect ratio, fits within maxWidth x maxHeight
 * Preserves transparency (alpha channel)
 */
export async function resizeImage(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number,
): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png({ quality: 90 })
    .toBuffer();
}

/**
 * Generate thumbnail (256x256) from image buffer
 */
export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return resizeImage(buffer, 256, 256);
}

/**
 * Validate image buffer
 * Returns metadata or throws error if invalid
 */
export async function validateImage(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
}> {
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image: cannot determine dimensions");
  }

  // Max dimensions check (4K)
  const MAX_DIMENSION = 2160;
  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    throw new Error(
      `Image dimensions too large. Max: ${MAX_DIMENSION}x${MAX_DIMENSION}, Got: ${metadata.width}x${metadata.height}`,
    );
  }

  // Max file size check (10MB)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (buffer.length > MAX_SIZE) {
    throw new Error(
      `Image file too large. Max: ${MAX_SIZE / 1024 / 1024}MB, Got: ${(
        buffer.length / 1024 / 1024
      ).toFixed(2)}MB`,
    );
  }

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format || "unknown",
    hasAlpha: metadata.hasAlpha ?? false,
  };
}
