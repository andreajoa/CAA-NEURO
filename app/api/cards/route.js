import { auth } from "@clerk/nextjs/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucket } from "@/lib/r2";

const defaultCards = [
  { id: "1", text: "Eu quero", category: "Básico", image: "" },
  { id: "2", text: "Água", category: "Necessidades", image: "" },
  { id: "3", text: "Comer", category: "Necessidades", image: "" },
  { id: "4", text: "Banheiro", category: "Necessidades", image: "" },
  { id: "5", text: "Estou feliz", category: "Emoções", image: "" },
  { id: "6", text: "Estou triste", category: "Emoções", image: "" },
  { id: "7", text: "Ajuda", category: "Básico", image: "" },
  { id: "8", text: "Obrigado", category: "Básico", image: "" },
];

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const key = `users/${userId}/cards.json`;
    const data = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const json = await streamToString(data.Body);
    return Response.json(JSON.parse(json));
  } catch {
    return Response.json({ cards: defaultCards });
  }
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const key = `users/${userId}/cards.json`;

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify({ cards: body.cards || [] }, null, 2),
      ContentType: "application/json",
    })
  );

  return Response.json({ ok: true });
}
