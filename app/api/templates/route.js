import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await d1Query(
      "SELECT id, slug, title, description, category, autor, autor_profissao, downloads, cards FROM board_templates WHERE aprovado=1 AND publico=1 ORDER BY id"
    );
    const templates = (rows || []).map(t => ({
      ...t,
      cards: typeof t.cards === "string" ? JSON.parse(t.cards) : (t.cards || []),
    }));
    return Response.json({ templates });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { slug } = await request.json();
    if (!slug) return Response.json({ error: "slug obrigatório" }, { status: 400 });
    await d1Query(
      "UPDATE board_templates SET downloads = COALESCE(downloads, 0) + 1 WHERE slug=?",
      [slug]
    );
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
