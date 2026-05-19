import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { profile, level, cards, title } = await request.json();
    if (!cards?.length) return Response.json({ error: "Cards obrigatórios" }, { status: 400 });
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await d1Query(
      "INSERT INTO shared_boards (token, user_id, profile, level, cards, title, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      [token, userId, profile || "infantil", level || "emergente", JSON.stringify(cards), title || "Prancha CAA"]
    );
    return Response.json({ token, url: `https://www.adhdautism.online/prancha/${token}` });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Token obrigatório" }, { status: 400 });
  try {
    const rows = await d1Query("SELECT * FROM shared_boards WHERE token=?", [token]);
    if (!rows?.length) return Response.json({ error: "Prancha não encontrada" }, { status: 404 });
    const board = rows[0];
    return Response.json({ board: { ...board, cards: JSON.parse(board.cards) } });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { token, cards, title } = await request.json();
    if (!token) return Response.json({ error: "Token obrigatório" }, { status: 400 });
    const rows = await d1Query("SELECT * FROM shared_boards WHERE token=? AND user_id=?", [token, userId]);
    if (!rows?.length) return Response.json({ error: "Prancha não encontrada" }, { status: 404 });
    await d1Query("UPDATE shared_boards SET cards=?, title=? WHERE token=? AND user_id=?",
      [JSON.stringify(cards), title || rows[0].title, token, userId]);
    return Response.json({ ok: true, message: "Prancha atualizada — o link já reflete as mudanças." });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}