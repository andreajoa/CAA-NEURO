import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if(!key){
      return NextResponse.json({error:"Missing key"},{status:400});
    }

    const allowedImageKey = /^(platform\/images\/|users\/[^/]+\/images\/)[a-zA-Z0-9/_-]+\.(webp|png|jpe?g|gif)$/i;
    if (!allowedImageKey.test(key)) {
      return NextResponse.json({ error: "Invalid image key" }, { status: 400 });
    }

    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    const buffer = await streamToBuffer(result.Body);
    const contentType = result.ContentType || "image/webp";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 415 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control":"public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("R2 file error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
