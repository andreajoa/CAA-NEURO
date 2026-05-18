import { auth } from "@clerk/nextjs/server";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const { results } = await db.prepare(
      "SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(userId).all();
    return Response.json({ patients: results });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nome, data_nascimento, diagnostico, responsavel, escola, medicamentos, objetivos_terapeuticos, observacoes } = await request.json();
    if (!nome) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    const db = getDB(request);
    const r = await db.prepare(
      `INSERT INTO patients (user_id,nome,data_nascimento,diagnostico,responsavel,escola,medicamentos,objetivos_terapeuticos,observacoes,anexos,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))`
    ).bind(userId,nome,data_nascimento||null,diagnostico||null,responsavel||null,escola||null,medicamentos||null,objetivos_terapeuticos||null,observacoes||null,'[]').run();
    return Response.json({ success: true, id: r.meta?.last_row_id });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, nome, data_nascimento, diagnostico, responsavel, escola, medicamentos, objetivos_terapeuticos, observacoes } = await request.json();
    if (!id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    const db = getDB(request);
    await db.prepare(
      `UPDATE patients SET nome=?,data_nascimento=?,diagnostico=?,responsavel=?,escola=?,medicamentos=?,objetivos_terapeuticos=?,observacoes=?,updated_at=datetime('now')
       WHERE id=? AND user_id=?`
    ).bind(nome,data_nascimento||null,diagnostico||null,responsavel||null,escola||null,medicamentos||null,objetivos_terapeuticos||null,observacoes||null,id,userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    const db = getDB(request);
    await db.prepare("DELETE FROM patients WHERE id=? AND user_id=?").bind(id,userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
