import { auth } from "@clerk/nextjs/server";
import { encryptSession, decryptSession } from "../../lib/crypto";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patient_id");
    const db = getDB(request);
    const query = patientId
      ? "SELECT * FROM sessions WHERE user_id=? AND patient_id=? ORDER BY created_at DESC"
      : "SELECT * FROM sessions WHERE user_id=? ORDER BY created_at DESC LIMIT 100";
    const { results } = patientId
      ? await db.prepare(query).bind(userId, patientId).all()
      : await db.prepare(query).bind(userId).all();
    return Response.json({ sessions: results.map(decryptSession) });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await request.json();
    const e = encryptSession(raw);
    const db = getDB(request);
    const r = await db.prepare(
      `INSERT INTO sessions (user_id,patient_id,data_sessao,duracao_minutos,evolucao_observada,objetivos_sessao,notas,created_at)
       VALUES (?,?,?,?,?,?,?,datetime('now'))`
    ).bind(userId, raw.patient_id, raw.data_sessao||null, raw.duracao_minutos||null,
       e.evolucao_observada||null, e.objetivos_sessao||null, e.notas||null).run();
    return Response.json({ success: true, id: r.meta?.last_row_id });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await request.json();
    if (!raw.id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    const e = encryptSession(raw);
    const db = getDB(request);
    await db.prepare(
      `UPDATE sessions SET data_sessao=?,duracao_minutos=?,evolucao_observada=?,objetivos_sessao=?,notas=?,updated_at=datetime('now')
       WHERE id=? AND user_id=?`
    ).bind(raw.data_sessao||null, raw.duracao_minutos||null,
       e.evolucao_observada||null, e.objetivos_sessao||null, e.notas||null, raw.id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    const db = getDB(request);
    await db.prepare("DELETE FROM sessions WHERE id=? AND user_id=?").bind(id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
