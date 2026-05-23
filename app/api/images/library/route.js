import { auth } from "@clerk/nextjs/server";
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin";


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
    forcePathStyle: true,
  });
}

const platformImages = [
  { id: "sim", label: "Sim", url: "/cards/level-1/sim.webp?v=20260521-optimized", source: "platform" },
  { id: "nao", label: "Não", url: "/cards/level-1/nao.webp?v=20260521-optimized", source: "platform" },
  { id: "me-da", label: "Me dá", url: "/cards/level-1/me-da.webp?v=20260521-optimized", source: "platform" },
  { id: "nao-quero", label: "Não quero", url: "/cards/level-1/nao-quero.webp?v=20260521-optimized", source: "platform" },
  { id: "mais", label: "Mais", url: "/cards/level-1/mais.webp?v=20260521-optimized", source: "platform" },
  { id: "agua", label: "Água", url: "/cards/level-1/agua.webp?v=20260521-optimized", source: "platform" },
  { id: "comer", label: "Comer", url: "/cards/level-1/comer.webp?v=20260521-optimized", source: "platform" },
  { id: "banheiro", label: "Banheiro", url: "/cards/level-1/banheiro.webp?v=20260521-optimized", source: "platform" },
  { id: "dor", label: "Dor", url: "/cards/level-1/dor.webp?v=20260521-optimized", source: "platform" },
  { id: "dormir", label: "Dormir", url: "/cards/level-1/dormir.webp?v=20260521-optimized", source: "platform" },
  { id: "remedio", label: "Remédio", url: "/cards/level-1/remedio.webp?v=20260521-optimized", source: "platform" },
  { id: "tomar-banho", label: "Tomar banho", url: "/cards/level-1/tomar-banho.webp?v=20260521-optimized", source: "platform" },
  { id: "feliz", label: "Feliz", url: "/cards/level-1/feliz.webp?v=20260521-optimized", source: "platform" },
  { id: "triste", label: "Triste", url: "/cards/level-1/triste.webp?v=20260521-optimized", source: "platform" },
  { id: "bravo", label: "Bravo", url: "/cards/level-1/bravo.webp?v=20260521-optimized", source: "platform" },
  { id: "medo", label: "Medo", url: "/cards/level-1/medo.webp?v=20260521-optimized", source: "platform" },
  { id: "cansado", label: "Cansado", url: "/cards/level-1/cansado.webp?v=20260521-optimized", source: "platform" },
  { id: "brincar", label: "Brincar", url: "/cards/level-1/brincar.webp?v=20260521-optimized", source: "platform" },
  { id: "parar", label: "Parar", url: "/cards/level-1/parar.webp?v=20260521-optimized", source: "platform" },
  { id: "sair", label: "Sair", url: "/cards/level-1/sair.webp?v=20260521-optimized", source: "platform" },
  { id: "passear", label: "Passear", url: "/cards/level-1/passear.webp?v=20260521-optimized", source: "platform" },
  { id: "escola", label: "Escola", url: "/cards/level-1/escola.webp?v=20260521-optimized", source: "platform" },
  { id: "esperar", label: "Esperar", url: "/cards/level-1/esperar.webp?v=20260521-optimized", source: "platform" },
  { id: "acabou", label: "Acabou", url: "/cards/level-1/acabou.webp?v=20260521-optimized", source: "platform" },
  { id: "ajuda", label: "Ajuda", url: "/cards/level-1/ajuda.webp?v=20260521-optimized", source: "platform" },
];

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Imagens do admin (platform/) — visíveis para todos
    const platformR2Result = await getR2Client().send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: "platform/images/",
      })
    ).catch(() => ({ Contents: [] }));

    const adminImages = await Promise.all((platformR2Result.Contents || []).map(async (item) => {
      let label = "Imagem da plataforma";
      try {
        const head = await getR2Client().send(new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: item.Key,
        }));
        if (head.Metadata?.label) label = decodeURIComponent(head.Metadata.label);
      } catch {}
      return {
        id: item.Key,
        label,
        url: imageUrlForKey(item.Key),
        source: "platform-admin",
      };
    }));

    const result = await getR2Client().send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: `users/${userId}/images/`,
      })
    );

    const userImages = await Promise.all((result.Contents || []).map(async (item) => {
      let label = "Imagem enviada";
      try {
        const head = await getR2Client().send(
          new HeadObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: item.Key,
          })
        );
        const rawLabel = head.Metadata?.label || label;
        try {
          label = decodeURIComponent(rawLabel);
        } catch {
          label = rawLabel;
        }
      } catch {}

      return {
        id: item.Key,
        key: item.Key,
        label,
        url: imageUrlForKey(item.Key),
        source: "user",
        updatedAt: item.LastModified,
      };
    }));

    return NextResponse.json({
      platformImages: [...platformImages, ...adminImages],
      userImages,
    });
  } catch (error) {
    console.error("R2 library error:", error);
    return NextResponse.json({ error: "Library failed" }, { status: 500 });
  }
}
