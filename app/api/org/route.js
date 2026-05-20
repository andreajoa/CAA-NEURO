import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";
export const runtime = "nodejs";
const ADMIN_ID = "tdahma2@gmail.com";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
        const url = new URL(request.url);
    const orgId = url.searchParams.get("org_id");

    if (orgId) {
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

      return Response.json({ org, members: members.results, stats });
    }

    const orgs = await d1Query("SELECT * FROM organizations ORDER BY created_at DESC") || [];
    return Response.json({ organizations: orgs.results });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nome, tipo, cidade, estado, cnpj, responsavel, email } = await request.json();
    if (!nome?.trim()) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    await d1Query(
      "INSERT INTO organizations (nome,tipo,cidade,estado,cnpj,responsavel,email,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))",
      [nome.trim(), tipo||"clinica", cidade||null, estado||null, cnpj||null, responsavel||null, email||null]
    );
    const [lastOrg] = await d1Query("SELECT id FROM organizations WHERE nome=? ORDER BY id DESC LIMIT 1", [nome.trim()]) || [{}];
    const orgId = lastOrg.id;
    await d1Query(
      "INSERT OR IGNORE INTO org_members (org_id,user_id,role,joined_at) VALUES (?,?,'admin',datetime('now'))",
      [orgId, userId]
    );
    return Response.json({ success: true, id: orgId });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
