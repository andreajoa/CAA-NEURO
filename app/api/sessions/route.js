import { auth } from "@clerk/nextjs/server";
import { encryptSession, decryptSession } from "../../lib/crypto";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const patientId = new URL(request.url).searchParams.get("patient_id");
    const db = getDB(request);
    const { results } = patientId
      ? await db.prepare("SELECT * FROM sessions WHERE user_id=? AND patient_id=? ORDER BY created_at DESC").bind(userId, patientId).all()
      : await db.prepare("SELECT * FROM sessions WHERE user_id=? ORDER BY created_at DESC").bind(userId).all();
    return Response.json({ sessions: results });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { patient_id, cards_usados, evolucao_observada, notas, objetivos_sessao, duracao_minutos } = body;
    if (!patient_id) return Response.json({ error: "patient_id obrigatório" }, { status: 400 });
    const db = getDB(request);
    const r = await db.prepare(
      `INSERT INTO sessions (user_id,patient_id,cards_usados,evolucao_observada,notas,objetivos_sessao,duracao_minutos,created_at)
       VALUES (?,?,?,?,?,?,?,datetime('now'))`
    ).bind(
      userId, patient_id,
      JSON.stringify(cards_usados || []),
      evolucao_observada || null,
      notas || null,
      objetivos_sessao || null,
      duracao_minutos || null
    ).run();
    return Response.json({ success: true, id: r.meta?.last_row_id });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    const db = getDB(request);
    await db.prepare("DELETE FROM sessions WHERE id=? AND user_id=?").bind(id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
