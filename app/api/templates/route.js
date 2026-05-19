import { auth } from "@clerk/nextjs/server";
export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const { results } = await db.prepare("SELECT id, slug, title, description, category, cards FROM board_templates ORDER BY id").all();
    return Response.json({ templates: results.map(t => ({ ...t, cards: JSON.parse(t.cards) })) });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
