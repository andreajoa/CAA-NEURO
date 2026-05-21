import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";


function imageUrlForKey(key) {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (base && base.startsWith("http")) {
    return `${base.replace(/\/$/, "")}/${key}`;
  }
  return `/api/images/file?key=${encodeURIComponent(key)}`;
}

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

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    const label = String(formData.get("label") || "Imagem").trim() || "Imagem";
    const safeLabel = encodeURIComponent(label).slice(0, 700);

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const id = crypto.randomUUID();

    const buffer = await sharp(originalBuffer)
      .resize({
        width: 512,
        height: 512,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 72 })
      .toBuffer();

    // Todas as imagens ficam otimizadas em WebP e disponíveis para todos os usuários
    const key = `users/${userId}/images/${id}.webp`;

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: "image/webp",
        Metadata: {
          label: safeLabel,
          userId: String(userId),
          source: "platform",
        },
      })
    );

    return NextResponse.json({
      id,
      key,
      label,
      url: imageUrlForKey(key),
      source: "platform",
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}
