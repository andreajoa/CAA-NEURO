export const runtime = "nodejs";
import { auth } from "@clerk/nextjs/server";
import { getDatabase } from "../../../lib/d1";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { message, stack, page, context } = await request.json();
    const db = getDatabase(request);
    await db.prepare(
      `INSERT INTO audit_logs (user_id, acao, recurso, detalhes, created_at)
       VALUES (?, 'FRONTEND_ERROR', ?, ?, datetime('now'))`
    ).bind(userId, String(page || "unknown").slice(0, 300), JSON.stringify({ message: String(message || "").slice(0, 1000), stack: stack?.slice(0, 2000), context }).slice(0, 5000)).run();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false });
  }
}
