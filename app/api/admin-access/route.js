import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
const ADMIN_EMAIL = "tdahma2@gmail.com";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine");
    let results;
    if (mine === "1") {
      const r = await db.prepare(
        "SELECT * FROM admin_access_requests WHERE target_user_id=? ORDER BY created_at DESC"
      ).bind(userId).all();
      results = r.results;
    } else {
      const r = await db.prepare(
        "SELECT * FROM admin_access_requests ORDER BY created_at DESC LIMIT 200"
      ).all();
      results = r.results;
    }
    return Response.json({ requests: results });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { target_user_id, motivo } = await request.json();
    if (!target_user_id || !motivo?.trim()) {
      return Response.json({ error: "target_user_id e motivo são obrigatórios." }, { status: 400 });
    }
    const db = getDB(request);
    await db.prepare(
      `INSERT INTO admin_access_requests (admin_id, target_user_id, motivo, aprovado, created_at)
       VALUES (?, ?, ?, 0, datetime('now'))`
    ).bind(userId, target_user_id, motivo.trim()).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, aprovado } = await request.json();
    const db = getDB(request);
    await db.prepare(
      `UPDATE admin_access_requests SET aprovado=?, aprovado_at=datetime('now') WHERE id=?`
    ).bind(aprovado ? 1 : 0, id).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
