import { auth } from "@clerk/nextjs/server";
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { d1Query } from "../../../../lib/d1";
import { isAdmin } from "../../../../lib/admin";

export const runtime = "nodejs";

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

function imageUrlForKey(key) {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (base && base.startsWith("http")) return `${base.replace(/\/$/, "")}/${key}`;
  return `/api/images/file?key=${encodeURIComponent(key)}`;
}

function norm(s="") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g," ")
    .trim();
}

async function listImages(prefix) {
  const r2 = getR2Client();
  const result = await r2.send(new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
    Prefix: prefix,
  })).catch(() => ({ Contents: [] }));

  const out = [];
  for (const item of result.Contents || []) {
    let label = "";
    try {
      const head = await r2.send(new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: item.Key,
      }));
      label = head.Metadata?.label ? decodeURIComponent(head.Metadata.label) : "";
    } catch {}
    out.push({
      key: item.Key,
      label,
      url: imageUrlForKey(item.Key),
      normalized: norm(label),
    });
  }
  return out;
}

export async function GET(req) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }

  const cards = [
    { id:"ansioso", label:"Estou ansioso", cat:"sentimentos" },
    { id:"cansado-a", label:"Estou cansado", cat:"sentimentos" },
    { id:"desconfortavel", label:"Estou desconfortável", cat:"sentimentos" },
    { id:"nao-quero-a", label:"Não quero isso", cat:"sentimentos" },
    { id:"nao-toque", label:"Não toque em mim", cat:"sentimentos" },
    { id:"fale-devagar-a", label:"Fale mais devagar", cat:"sentimentos" },
    { id:"fale-baixo", label:"Fale mais baixo", cat:"sentimentos" },
    { id:"privacidade-a", label:"Quero privacidade", cat:"sentimentos" },
    { id:"me-acalmar", label:"Preciso me acalmar", cat:"sentimentos" },
    { id:"respeite-tempo", label:"Respeite meu tempo", cat:"sentimentos" },
  ];

  const [platformImages, userImages] = await Promise.all([
    listImages("platform/images/"),
    listImages(`users/${userId}/images/`),
  ]);

  const allImages = [...userImages, ...platformImages];

  const repaired = cards.map(card => {
    const target = norm(card.label);

    const exact = allImages.find(img => img.normalized === target);

    const contains = allImages.find(img =>
      img.normalized.includes(target) || target.includes(img.normalized)
    );

    const match = exact || contains;

    return {
      ...card,
      image: match?.url || "",
      image_url: match?.url || "",
      matchedLabel: match?.label || null,
      matchedKey: match?.key || null,
    };
  });

  const apply = new URL(req.url).searchParams.get("apply") === "1";

  if (apply) {
    await d1Query(
      `INSERT INTO admin_defaults (key,cards,updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET cards=excluded.cards, updated_at=datetime('now')`,
      ["adulto_conversacao", JSON.stringify(repaired)]
    );
  }

  return Response.json({
    apply,
    totalImagesFound: allImages.length,
    matched: repaired.filter(c => c.image).length,
    missing: repaired.filter(c => !c.image).map(c => c.label),
    cards: repaired,
  });
}
