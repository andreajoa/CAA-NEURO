export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function POST(request) {
  try {
    const { message, stack, page, user_id, context } = await request.json();
    const db = getDB(request);
    await db.prepare(
      `INSERT INTO audit_logs (user_id, acao, recurso, detalhes, created_at)
       VALUES (?, 'FRONTEND_ERROR', ?, ?, datetime('now'))`
    ).bind(user_id || "anonymous", page || "unknown", JSON.stringify({ message, stack: stack?.slice(0, 500), context })).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false });
  }
}
