import { auth } from "@clerk/nextjs/server";
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
  });
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    const isUserImage = key && key.startsWith(`users/${userId}/images/`);
    const isPlatformImage = key && key.startsWith("platform/images/");

    if (!isUserImage && !isPlatformImage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await getR2Client().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    const buffer = await streamToBuffer(result.Body);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": result.ContentType || "image/png",
        "Cache-Control":"public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("R2 file error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
