import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const rows = await d1Query("SELECT id, slug, title, description, category, cards FROM board_templates ORDER BY id");
    const templates = (rows || []).map(t => ({ ...t, cards: JSON.parse(t.cards) }));
    return Response.json({ templates });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
