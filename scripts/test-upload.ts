/**
 * R2 图片上传流程测试脚本
 *
 * 使用方法：
 * 1. 确保已配置所有 R2 环境变量
 * 2. 确保已运行 bun run scripts/init-db.ts 创建表
 * 3. 确保用户已登录（需要有效的 session）
 * 4. 运行：bun run scripts/test-upload.ts
 */

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import postgres from "postgres";
import sharp from "sharp";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "thumbfree";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error(
    "Missing R2 configuration. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.",
  );
}

// TypeScript 不知道这些已通过检查，所以需要重新赋值来 Narrowing
const r2Endpoint = R2_ENDPOINT;
const r2AccessKeyId = R2_ACCESS_KEY_ID;
const r2SecretAccessKey = R2_SECRET_ACCESS_KEY;

const sql = postgres(databaseUrl);

// 模拟一个测试用户（实际使用时应使用真实登录用户）
const TEST_USER_ID = "test-user-123";

async function testUploadFlow() {
  console.log("🧪 Testing R2 Upload Flow\n");

  // 1. 创建测试用户（如果不存在）
  console.log("1. Creating test user...");
  const existingUser =
    await sql`SELECT id FROM "user" WHERE id = ${TEST_USER_ID}`;

  if (existingUser.length === 0) {
    await sql`
      INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
      VALUES (${TEST_USER_ID}, 'Test User', 'test@example.com', true, NOW(), NOW())
    `;
    console.log("   ✓ Test user created");
  } else {
    console.log("   ✓ Test user already exists");
  }

  // 2. 生成 Presigned URL
  console.log("\n2. Generating presigned upload URL...");

  const r2Client = new S3Client({
    region: "auto",
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
    },
  });

  const testKey = `uploads/${TEST_USER_ID}/${crypto.randomUUID()}.webp`;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: testKey,
    ContentType: "image/webp",
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 300,
  });
  console.log("   ✓ Presigned URL generated");
  console.log(`   URL: ${presignedUrl.substring(0, 80)}...`);

  // 3. 创建一个测试图片并上传
  console.log("\n3. Creating and uploading test image...");

  const testImageBuffer = await sharp({
    create: {
      width: 1920,
      height: 1080,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .webp({ quality: 80 })
    .toBuffer();

  console.log(`   ✓ Test image created (${testImageBuffer.length} bytes)`);

  // 上传到 R2
  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/webp" },
    body: new Uint8Array(testImageBuffer),
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
    );
  }

  console.log("   ✓ Image uploaded to R2 successfully");

  // 4. 保存元数据到数据库
  console.log("\n4. Saving image metadata to database...");

  const publicUrl = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${testKey}`
    : `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${testKey}`;

  const [imageRecord] = await sql`
    INSERT INTO images (id, user_id, type, filename, original_name, mime_type, size, width, height, r2_key, r2_url, created_at)
    VALUES (
      ${crypto.randomUUID()},
      ${TEST_USER_ID},
      'uploads',
      'test-image.webp',
      'test-image.jpg',
      'image/webp',
      ${testImageBuffer.length.toString()},
      '1920',
      '1080',
      ${testKey},
      ${publicUrl},
      NOW()
    )
    RETURNING *
  `;

  console.log("   ✓ Metadata saved to database");
  console.log(`   Image ID: ${imageRecord.id}`);
  console.log(`   Public URL: ${publicUrl}`);

  // 5. 查询图片列表
  console.log("\n5. Querying user's images...");
  const userImages = await sql`
    SELECT * FROM images WHERE user_id = ${TEST_USER_ID} ORDER BY created_at DESC LIMIT 5
  `;

  console.log(`   ✓ Found ${userImages.length} images`);
  userImages.forEach((img: Record<string, unknown>, i: number) => {
    console.log(`   ${i + 1}. ${img.filename} (${img.size} bytes)`);
  });

  // 6. 清理测试数据
  console.log("\n6. Cleaning up test data...");

  // 从 R2 删除
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
    }),
  );
  console.log("   ✓ Image deleted from R2");

  // 从数据库删除
  await sql`DELETE FROM images WHERE user_id = ${TEST_USER_ID}`;
  console.log("   ✓ Image records deleted from database");

  // 删除测试用户
  await sql`DELETE FROM "user" WHERE id = ${TEST_USER_ID}`;
  console.log("   ✓ Test user deleted");

  console.log("\n✅ All tests passed!");
  console.log("\n📋 Summary:");
  console.log("   - Presigned URL generation: ✓");
  console.log("   - Direct upload to R2: ✓");
  console.log("   - Database record creation: ✓");
  console.log("   - Image listing: ✓");
  console.log("   - Cleanup: ✓");
}

testUploadFlow()
  .then(() => sql.end())
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
