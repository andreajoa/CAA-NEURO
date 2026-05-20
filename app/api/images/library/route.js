import { auth } from "@clerk/nextjs/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
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

const platformImages = [
  { id: "sim", label: "Sim", url: "/cards/level-1/sim.png?v=20260520-1705", source: "platform" },
  { id: "nao", label: "Não", url: "/cards/level-1/nao.png?v=20260520-1705", source: "platform" },
  { id: "me-da", label: "Me dá", url: "/cards/level-1/me-da.png?v=20260520-1705", source: "platform" },
  { id: "nao-quero", label: "Não quero", url: "/cards/level-1/nao-quero.png?v=20260520-1705", source: "platform" },
  { id: "mais", label: "Mais", url: "/cards/level-1/mais.png?v=20260520-1705", source: "platform" },
  { id: "agua", label: "Água", url: "/cards/level-1/agua.png?v=20260520-1705", source: "platform" },
  { id: "comer", label: "Comer", url: "/cards/level-1/comer.png?v=20260520-1705", source: "platform" },
  { id: "banheiro", label: "Banheiro", url: "/cards/level-1/banheiro.png?v=20260520-1705", source: "platform" },
  { id: "dor", label: "Dor", url: "/cards/level-1/dor.png?v=20260520-1705", source: "platform" },
  { id: "dormir", label: "Dormir", url: "/cards/level-1/dormir.png?v=20260520-1705", source: "platform" },
  { id: "remedio", label: "Remédio", url: "/cards/level-1/remedio.png?v=20260520-1705", source: "platform" },
  { id: "tomar-banho", label: "Tomar banho", url: "/cards/level-1/tomar-banho.png?v=20260520-1705", source: "platform" },
  { id: "feliz", label: "Feliz", url: "/cards/level-1/feliz.png?v=20260520-1705", source: "platform" },
  { id: "triste", label: "Triste", url: "/cards/level-1/triste.png?v=20260520-1705", source: "platform" },
  { id: "bravo", label: "Bravo", url: "/cards/level-1/bravo.png?v=20260520-1705", source: "platform" },
  { id: "medo", label: "Medo", url: "/cards/level-1/medo.png?v=20260520-1705", source: "platform" },
  { id: "cansado", label: "Cansado", url: "/cards/level-1/cansado.png?v=20260520-1705", source: "platform" },
  { id: "brincar", label: "Brincar", url: "/cards/level-1/brincar.png?v=20260520-1705", source: "platform" },
  { id: "parar", label: "Parar", url: "/cards/level-1/parar.png?v=20260520-1705", source: "platform" },
  { id: "sair", label: "Sair", url: "/cards/level-1/sair.png?v=20260520-1705", source: "platform" },
  { id: "passear", label: "Passear", url: "/cards/level-1/passear.png?v=20260520-1705", source: "platform" },
  { id: "escola", label: "Escola", url: "/cards/level-1/escola.png?v=20260520-1705", source: "platform" },
  { id: "esperar", label: "Esperar", url: "/cards/level-1/esperar.png?v=20260520-1705", source: "platform" },
  { id: "acabou", label: "Acabou", url: "/cards/level-1/acabou.png?v=20260520-1705", source: "platform" },
  { id: "ajuda", label: "Ajuda", url: "/cards/level-1/ajuda.png?v=20260520-1705", source: "platform" },
];

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getR2Client().send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: `users/${userId}/images/`,
      })
    );

    const userImages = (result.Contents || []).map((item) => ({
      id: item.Key,
      key: item.Key,
      label: "Imagem enviada",
      url: `/api/images/file?key=${encodeURIComponent(item.Key)}`,
      source: "user",
      updatedAt: item.LastModified,
    }));

    return NextResponse.json({
      platformImages,
      userImages,
    });
  } catch (error) {
    console.error("R2 library error:", error);
    return NextResponse.json({ error: "Library failed" }, { status: 500 });
  }
}
