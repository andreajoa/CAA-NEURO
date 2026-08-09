import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";
import { isAdmin } from "../../../lib/admin";
export const runtime = "nodejs";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
        const url = new URL(request.url);
    const orgId = url.searchParams.get("org_id");

    if (orgId) {
      if (!isAdmin(userId)) {
        const membership = await d1Query(
          "SELECT 1 FROM org_members WHERE org_id=? AND user_id=? AND ativo!=0 LIMIT 1",
          [orgId, userId]
        );
        if (!membership?.length) return Response.json({ error: "Acesso negado" }, { status: 403 });
      }
      const [org] = await d1Query("SELECT * FROM organizations WHERE id=?", [orgId]) || [];
      if (!org) return Response.json({ error: "Org não encontrada" }, { status: 404 });
      const members = await d1Query("SELECT * FROM org_members WHERE org_id=?", [orgId]) || [];

      const memberIds = members.map(m => m.user_id);
      let stats = { patients: 0, sessions: 0 };
      for (const uid of memberIds) {
        const [p] = await d1Query("SELECT COUNT(*) as c FROM patients WHERE user_id=?", [uid]) || [{}];
        const [s] = await d1Query("SELECT COUNT(*) as c FROM sessions WHERE user_id=?", [uid]) || [{}];
        stats.patients += p?.c || 0;
        stats.sessions += s?.c || 0;
      }

      return Response.json({ org, members, stats });
    }

    const orgs = isAdmin(userId)
      ? await d1Query("SELECT * FROM organizations ORDER BY created_at DESC") || []
      : await d1Query(
          `SELECT o.* FROM organizations o
           INNER JOIN org_members m ON m.org_id=o.id
           WHERE m.user_id=? AND m.ativo!=0 ORDER BY o.created_at DESC`,
          [userId]
        ) || [];
    return Response.json({ organizations: orgs });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const existing = await d1Query(
      "SELECT org_id FROM org_members WHERE user_id=? AND role='admin' LIMIT 1", [userId]
    );
    if (existing?.length) {
      return Response.json({ error: "Sua conta já administra uma organização" }, { status: 409 });
    }

    const { nome, tipo, cidade, estado, cnpj, responsavel, email } = await request.json();
    if (!nome?.trim()) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    const safeName = nome.trim().slice(0, 160);
    const safeType = ["clinica", "instituicao"].includes(tipo) ? tipo : "clinica";
    await d1Query(
      `INSERT INTO organizations
       (nome,tipo,cidade,estado,cnpj,responsavel,email,plano,ativo,max_profissionais,max_pacientes,created_at)
       VALUES (?,?,?,?,?,?,?,'gratuito',0,1,3,datetime('now'))`,
      [safeName, safeType, cidade?.trim().slice(0, 120)||null, estado?.trim().slice(0, 40)||null,
       cnpj?.trim().slice(0, 30)||null, responsavel?.trim().slice(0, 160)||null, email?.trim().toLowerCase().slice(0, 254)||null]
    );
    const [lastOrg] = await d1Query("SELECT id FROM organizations WHERE nome=? ORDER BY id DESC LIMIT 1", [safeName]) || [{}];
    const orgId = lastOrg.id;
    await d1Query(
      "INSERT OR IGNORE INTO org_members (org_id,user_id,role,joined_at) VALUES (?,?,'admin',datetime('now'))",
      [orgId, userId]
    );
    return Response.json({ success: true, id: orgId });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
