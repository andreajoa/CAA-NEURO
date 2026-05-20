import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../../lib/d1";
import { isAdmin } from "../../../../lib/admin";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const profile = url.searchParams.get("profile") || "infantil";
    const level = url.searchParams.get("level") || "emergente";
    const key = `${profile}_${level}`;
    const rows = await d1Query(
      "SELECT cards FROM admin_defaults WHERE key=? LIMIT 1", [key]
    );
    if (!rows?.length) return Response.json({ cards: null });
    return Response.json({ cards: JSON.parse(rows[0].cards) });
  } catch {
    return Response.json({ cards: null });
  }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return Response.json({ error: "Acesso negado" }, { status: 403 });
  }
  try {
    const { cards, profile, level } = await request.json();
    const key = `${profile || "infantil"}_${level || "emergente"}`;
    await d1Query(
      `INSERT INTO admin_defaults (key, cards, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET cards=excluded.cards, updated_at=datetime('now')`,
      [key, JSON.stringify(cards)]
    );
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
