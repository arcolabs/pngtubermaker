import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await getR2Client().send(command);
}

export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    const publicUrl = R2_PUBLIC_URL.startsWith("http")
      ? R2_PUBLIC_URL
      : `https://${R2_PUBLIC_URL}`;
    return `${publicUrl}/${key}`;
  }
  return `${R2_ENDPOINT}/${bucketName}/${key}`;
}

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
