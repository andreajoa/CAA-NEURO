import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucket, publicUrl } from "@/lib/r2";
import { v4 as uuid } from "uuid";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");

  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name?.split(".").pop() || "jpg";
  const key = `users/${userId}/images/${uuid()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    })
  );

  return Response.json({ url: `${publicUrl}/${key}` });
}
