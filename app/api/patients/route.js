import { auth } from "@clerk/nextjs/server";
import { encryptPatient, decryptPatient } from "../../lib/crypto";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";
const LIMITE_GRATUITO = 3;

async function getPlanoEOrg(userId) {
  try {
    const rows = await d1Query("SELECT plano, org_id FROM users WHERE id=?", [userId]);
    const u = rows?.[0];
    if (!u) return { plano: "gratuito", orgId: null };
    if (u.org_id) {
      const org = await d1Query("SELECT plano, ativo, max_pacientes FROM organizations WHERE id=? AND ativo=1", [u.org_id]);
      if (org?.[0]) return { plano: org[0].plano || "clinica", orgId: u.org_id, maxPac: org[0].max_pacientes };
    }
    return { plano: u.plano || "gratuito", orgId: null };
  } catch { return { plano: "gratuito", orgId: null }; }
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { orgId } = await getPlanoEOrg(userId);

    let rows;
    if (orgId) {
      // Org: busca pacientes de todos os membros da org
      const members = await d1Query("SELECT user_id FROM org_members WHERE org_id=? AND ativo!=0", [orgId]);
      const ids = (members || []).map(m => `'${m.user_id}'`).join(",");
      if (!ids) return Response.json({ patients: [] });
      rows = await d1Query(`SELECT * FROM patients WHERE user_id IN (${ids}) ORDER BY created_at DESC`);
    } else {
      rows = await d1Query("SELECT * FROM patients WHERE user_id=? ORDER BY created_at DESC", [userId]);
    }

    const patients = (rows || []).map(row => decryptPatient({ ...row, nome: row.nome || row.name || "" }));
    return Response.json({ patients });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { plano, orgId, maxPac } = await getPlanoEOrg(userId);

    if (plano === "gratuito") {
      const count = await d1Query("SELECT COUNT(*) as total FROM patients WHERE user_id=?", [userId]);
      if ((count?.[0]?.total || 0) >= LIMITE_GRATUITO) {
        return Response.json({
          error: "limite_atingido",
          message: `Plano gratuito: até ${LIMITE_GRATUITO} pacientes. Faça upgrade.`,
          upgrade_url: "/planos", limite: LIMITE_GRATUITO,
        }, { status: 403 });
      }
    } else if (orgId && maxPac) {
      const members = await d1Query("SELECT user_id FROM org_members WHERE org_id=?", [orgId]);
      const ids = (members || []).map(m => `'${m.user_id}'`).join(",");
      if (ids) {
        const count = await d1Query(`SELECT COUNT(*) as total FROM patients WHERE user_id IN (${ids})`);
        if ((count?.[0]?.total || 0) >= maxPac) {
          return Response.json({ error: "limite_atingido", message: `Limite de ${maxPac} pacientes atingido.` }, { status: 403 });
        }
      }
    }

    const raw = await request.json();
    if (!raw.nome) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    const e = encryptPatient(raw);

    const result = await d1Query(
      `INSERT INTO patients (user_id,nome,name,data_nascimento,diagnostico,responsavel,escola,medicamentos,objetivos_terapeuticos,observacoes,anexos,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
      [userId, e.nome, e.nome, e.data_nascimento||null, e.diagnostico||null, e.responsavel||null,
       e.escola||null, e.medicamentos||null, e.objetivos_terapeuticos||null, e.observacoes||null, '[]']
    );
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const raw = await request.json();
    if (!raw.id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    const e = encryptPatient(raw);
    const { orgId } = await getPlanoEOrg(userId);

    // Org: qualquer membro pode editar pacientes da org
    if (orgId) {
      const members = await d1Query("SELECT user_id FROM org_members WHERE org_id=?", [orgId]);
      const ids = (members || []).map(m => `'${m.user_id}'`).join(",");
      await d1Query(
        `UPDATE patients SET nome=?,name=?,data_nascimento=?,diagnostico=?,responsavel=?,escola=?,medicamentos=?,objetivos_terapeuticos=?,observacoes=?,updated_at=datetime('now')
         WHERE id=? AND user_id IN (${ids})`,
        [e.nome, e.nome, e.data_nascimento||null, e.diagnostico||null, e.responsavel||null,
         e.escola||null, e.medicamentos||null, e.objetivos_terapeuticos||null, e.observacoes||null, raw.id]
      );
    } else {
      await d1Query(
        `UPDATE patients SET nome=?,name=?,data_nascimento=?,diagnostico=?,responsavel=?,escola=?,medicamentos=?,objetivos_terapeuticos=?,observacoes=?,updated_at=datetime('now')
         WHERE id=? AND user_id=?`,
        [e.nome, e.nome, e.data_nascimento||null, e.diagnostico||null, e.responsavel||null,
         e.escola||null, e.medicamentos||null, e.objetivos_terapeuticos||null, e.observacoes||null, raw.id, userId]
      );
    }
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "ID obrigatório" }, { status: 400 });
    await d1Query("DELETE FROM patients WHERE id=? AND user_id=?", [id, userId]);
    return Response.json({ success: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
