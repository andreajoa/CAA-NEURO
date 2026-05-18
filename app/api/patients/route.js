import { auth } from "@clerk/nextjs/server";
import { encryptPatient, decryptPatient } from "../../lib/crypto";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const { results } = await db.prepare(
      "SELECT * FROM patients WHERE user_id=? ORDER BY created_at DESC"
    ).bind(userId).all();
    return Response.json({ patients: results.map(decryptPatient) });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await request.json();
    if (!raw.nome) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    const e = encryptPatient(raw);
    const db = getDB(request);
    const r = await db.prepare(
      `INSERT INTO patients (user_id,nome,data_nascimento,diagnostico,responsavel,escola,medicamentos,objetivos_terapeuticos,observacoes,anexos,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))`
    ).bind(userId,e.nome,e.data_nascimento||null,e.diagnostico||null,e.responsavel||null,e.escola||null,e.medicamentos||null,e.objetivos_terapeuticos||null,e.observacoes||null,"[]").run();
    return Response.json({ success: true, id: r.meta?.last_row_id });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await request.json();
    if (!raw.id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    const e = encryptPatient(raw);
    const db = getDB(request);
    await db.prepare(
      `UPDATE patients SET nome=?,data_nascimento=?,diagnostico=?,responsavel=?,escola=?,medicamentos=?,objetivos_terapeuticos=?,observacoes=?,updated_at=datetime('now')
       WHERE id=? AND user_id=?`
    ).bind(e.nome,e.data_nascimento||null,e.diagnostico||null,e.responsavel||null,e.escola||null,e.medicamentos||null,e.objetivos_terapeuticos||null,e.observacoes||null,raw.id,userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    const db = getDB(request);
    await db.prepare("DELETE FROM patients WHERE id=? AND user_id=?").bind(id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
