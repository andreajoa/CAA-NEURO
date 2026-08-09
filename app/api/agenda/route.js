import { auth } from "@clerk/nextjs/server";
import { getDatabase } from "../../../lib/d1";
import { decrypt, encrypt } from "../../lib/crypto";

export const runtime = "nodejs";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const mes = url.searchParams.get("mes");
    const db = getDatabase(request);
    const { results } = mes
      ? await db.prepare(
          "SELECT a.*, p.nome as paciente_nome FROM agenda a LEFT JOIN patients p ON a.patient_id=p.id WHERE a.user_id=? AND a.data LIKE ? ORDER BY a.data, a.hora_inicio"
        ).bind(userId, `${mes}%`).all()
      : await db.prepare(
          "SELECT a.*, p.nome as paciente_nome FROM agenda a LEFT JOIN patients p ON a.patient_id=p.id WHERE a.user_id=? ORDER BY a.data DESC, a.hora_inicio LIMIT 100"
        ).bind(userId).all();
    return Response.json({ agenda: results.map(item => ({
      ...item,
      titulo: decrypt(item.titulo),
      notas: decrypt(item.notas),
      paciente_nome: decrypt(item.paciente_nome),
    })) });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { patient_id, titulo, data, hora_inicio, hora_fim, tipo, notas } = await request.json();
    if (!titulo || !data || !hora_inicio) return Response.json({ error: "titulo, data e hora_inicio obrigatórios" }, { status: 400 });
    const db = getDatabase(request);
    const r = await db.prepare(
      `INSERT INTO agenda (user_id, patient_id, titulo, data, hora_inicio, hora_fim, tipo, notas, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'agendado', datetime('now'))`
    ).bind(userId, patient_id||null, encrypt(titulo), data, hora_inicio, hora_fim||null, tipo||'sessao', encrypt(notas)||null).run();
    return Response.json({ success: true, id: r.meta?.last_row_id });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, status, notas, hora_inicio, hora_fim } = await request.json();
    const db = getDatabase(request);
    await db.prepare(
      `UPDATE agenda SET status=COALESCE(?,status), notas=COALESCE(?,notas), hora_inicio=COALESCE(?,hora_inicio), hora_fim=COALESCE(?,hora_fim)
       WHERE id=? AND user_id=?`
    ).bind(status||null, notas === undefined ? null : encrypt(notas), hora_inicio||null, hora_fim||null, id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    const db = getDatabase(request);
    await db.prepare("DELETE FROM agenda WHERE id=? AND user_id=?").bind(id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
