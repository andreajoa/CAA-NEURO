import { auth } from "@clerk/nextjs/server";
export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { profile, level, cards, title } = await request.json();
    if (!cards?.length) return Response.json({ error: "Cards obrigatórios" }, { status: 400 });
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const db = getDB(request);
    await db.prepare(
      `INSERT INTO shared_boards (token, user_id, profile, level, cards, title, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(token, userId, profile || "infantil", level || "emergente", JSON.stringify(cards), title || "Prancha CAA").run();
    return Response.json({ token, url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.adhdautism.online"}/prancha/${token}` });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Token obrigatório" }, { status: 400 });
  try {
    const db = getDB(request);
    const board = await db.prepare("SELECT * FROM shared_boards WHERE token=?").bind(token).first();
    if (!board) return Response.json({ error: "Prancha não encontrada" }, { status: 404 });
    return Response.json({ board: { ...board, cards: JSON.parse(board.cards) } });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
