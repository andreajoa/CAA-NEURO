import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import crypto from "crypto";

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name?.split(".").pop() || "png";
    const id = crypto.randomUUID();

    // Admin: salva em platform/ — disponível para todos
    // Usuário normal: salva em users/{id}/ — privado
    // Todas as imagens ficam em platform/ — disponíveis para todos os usuários
    const key = `platform/images/${id}.${extension}`;

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/png",
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
      url: `/api/images/file?key=${encodeURIComponent(key)}`,
      source: admin ? "platform" : "user",
    });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}
