import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getMimeTypeFromFilename, IMAGE_CONFIG } from "@/lib/services/image";
import { generateFileKey, getPublicUrl } from "@/lib/services/r2";

// Anonymous user ID for public uploads
const ANONYMOUS_USER_ID = "anonymous";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum allowed is ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    // Validate MIME type
    const contentType = file.type || getMimeTypeFromFilename(file.name);
    if (!IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${IMAGE_CONFIG.ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image (resize, compress, convert to WebP)
    let processedBuffer: Buffer;
    let metadata: {
      width: number;
      height: number;
      size: number;
      mimeType: string;
    };

    try {
      const image = sharp(buffer);
      const meta = await image.metadata();

      // Resize if needed
      let processedImage = image;
      if (
        meta.width &&
        meta.height &&
        (meta.width > IMAGE_CONFIG.MAX_WIDTH ||
          meta.height > IMAGE_CONFIG.MAX_HEIGHT)
      ) {
        processedImage = processedImage.resize(
          IMAGE_CONFIG.MAX_WIDTH,
          IMAGE_CONFIG.MAX_HEIGHT,
          {
            fit: "inside",
            withoutEnlargement: true,
          },
        );
      }

      // Convert to WebP and compress
      processedBuffer = await processedImage
        .webp({ quality: IMAGE_CONFIG.COMPRESSION_QUALITY })
        .toBuffer();

      // Further compress if needed
      let quality = IMAGE_CONFIG.COMPRESSION_QUALITY;
      while (
        processedBuffer.length > IMAGE_CONFIG.TARGET_FILE_SIZE &&
        quality > 20
      ) {
        quality -= 10;
        processedBuffer = await processedImage.webp({ quality }).toBuffer();
      }

      // Get final metadata
      const finalMeta = await sharp(processedBuffer).metadata();
      metadata = {
        width: finalMeta.width || 0,
        height: finalMeta.height || 0,
        size: processedBuffer.length,
        mimeType: "image/webp",
      };
    } catch {
      return NextResponse.json(
        {
          error:
            "Failed to process image. Please ensure it's a valid image file.",
        },
        { status: 400 },
      );
    }

    // Generate R2 file path
    const key = generateFileKey(ANONYMOUS_USER_ID, "uploads");

    // Upload to R2 using server (no CORS issues)
    const { r2Client, bucketName } = await import("@/lib/services/r2");
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: processedBuffer,
        ContentType: metadata.mimeType,
      }),
    );

    // Get public URL
    const url = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      data: {
        image: {
          id: key,
          type: "uploads" as const,
          filename: key.split("/").pop(),
          originalName: file.name,
          url,
          size: metadata.size,
          width: metadata.width,
          height: metadata.height,
          mimeType: metadata.mimeType,
        },
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
