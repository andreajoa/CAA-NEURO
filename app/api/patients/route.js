import { auth } from "@clerk/nextjs/server";
import { encryptPatient, decryptPatient } from "../../lib/crypto";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;
const LIMITE_GRATUITO = 3;

async function getPlano(db, userId) {
  try {
    const u = await db.prepare("SELECT plano, org_id FROM users WHERE id=?").bind(userId).first();
    if (u?.org_id) return "institucional";
    return u?.plano || "gratuito";
  } catch { return "gratuito"; }
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const { results } = await db.prepare(
      "SELECT * FROM patients WHERE user_id=? ORDER BY created_at DESC"
    ).bind(userId).all();
    const patients = results.map(row => decryptPatient({
      ...row,
      nome: row.nome || row.name || "",
    }));
    return Response.json({ patients });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const plano = await getPlano(db, userId);

    if (plano === "gratuito") {
      const count = await db.prepare(
        "SELECT COUNT(*) as total FROM patients WHERE user_id=?"
      ).bind(userId).first();
      if ((count?.total || 0) >= LIMITE_GRATUITO) {
        return Response.json({
          error: "limite_atingido",
          message: `O plano gratuito permite até ${LIMITE_GRATUITO} pacientes. Faça upgrade para Pro.`,
          upgrade_url: "/planos",
          limite: LIMITE_GRATUITO,
        }, { status: 403 });
      }
    }

    const raw = await request.json();
    if (!raw.nome) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    const e = encryptPatient(raw);

    const r = await db.prepare(
      `INSERT INTO patients (user_id,nome,name,data_nascimento,diagnostico,responsavel,escola,medicamentos,objetivos_terapeuticos,observacoes,anexos,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`
    ).bind(
      userId, e.nome, e.nome,
      e.data_nascimento||null, e.diagnostico||null, e.responsavel||null,
      e.escola||null, e.medicamentos||null, e.objetivos_terapeuticos||null,
      e.observacoes||null, '[]'
    ).run();
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
      `UPDATE patients SET nome=?,name=?,data_nascimento=?,diagnostico=?,responsavel=?,escola=?,medicamentos=?,objetivos_terapeuticos=?,observacoes=?,updated_at=datetime('now')
       WHERE id=? AND user_id=?`
    ).bind(
      e.nome, e.nome, e.data_nascimento||null, e.diagnostico||null,
      e.responsavel||null, e.escola||null, e.medicamentos||null,
      e.objetivos_terapeuticos||null, e.observacoes||null,
      raw.id, userId
    ).run();
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
    await db.prepare("DELETE FROM patients WHERE id=? AND user_id=?").bind(id, userId).run();
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
