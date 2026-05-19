import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await d1Query(
      "SELECT plano, org_id FROM users WHERE id=?",
      [userId]
    ).catch(() => []);

    const user = rows?.[0];
    const plano = user?.org_id ? "institucional" : (user?.plano || "gratuito");

    if (plano === "gratuito") {
      return Response.json({
        error: "geração_bloqueada",
        message: "Geração de imagens disponível apenas no plano Pro.",
        upgrade_url: "/planos"
      }, { status: 403 });
    }

    const { descricao, estilo } = await request.json();
    if (!descricao) return Response.json({ error: "Descrição obrigatória" }, { status: 400 });

    const estiloPrompt = estilo === "realista"
      ? "realistic photo, clean white background, centered object"
      : "flat illustration, pictogram style, AAC communication card, simple shapes, bold outlines, white background, child-friendly, colorful";

    const prompt = `${estiloPrompt}, ${descricao}, suitable for augmentative and alternative communication (AAC), high contrast, clear and simple`;

    const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: "square",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    const data = await response.json();
    if (!response.ok) return Response.json({ error: data.detail || "Erro na geração" }, { status: 500 });

    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) return Response.json({ error: "Imagem não gerada" }, { status: 500 });

    await d1Query(
      `INSERT INTO images (user_id, url, nome, fonte, created_at) VALUES (?,?,?,?,datetime('now'))`,
      [userId, imageUrl, descricao, "fal-ai"]
    ).catch(() => {});

    return Response.json({ success: true, url: imageUrl, descricao });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
