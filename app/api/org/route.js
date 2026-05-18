import { auth } from "@clerk/nextjs/server";
export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;
const ADMIN_ID = "tdahma2@gmail.com";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const url = new URL(request.url);
    const orgId = url.searchParams.get("org_id");

    if (orgId) {
      const org = await db.prepare("SELECT * FROM organizations WHERE id=?").bind(orgId).first();
      if (!org) return Response.json({ error: "Org não encontrada" }, { status: 404 });
      const members = await db.prepare("SELECT * FROM org_members WHERE org_id=?").bind(orgId).all();

      const memberIds = (members.results || []).map(m => m.user_id);
      let stats = { patients: 0, sessions: 0 };
      for (const uid of memberIds) {
        const p = await db.prepare("SELECT COUNT(*) as c FROM patients WHERE user_id=?").bind(uid).first();
        const s = await db.prepare("SELECT COUNT(*) as c FROM sessions WHERE user_id=?").bind(uid).first();
        stats.patients += p?.c || 0;
        stats.sessions += s?.c || 0;
      }

      return Response.json({ org, members: members.results, stats });
    }

    const orgs = await db.prepare("SELECT * FROM organizations ORDER BY created_at DESC").all();
    return Response.json({ organizations: orgs.results });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nome, tipo, cidade, estado, cnpj, responsavel, email } = await request.json();
    if (!nome?.trim()) return Response.json({ error: "Nome obrigatório" }, { status: 400 });
    const db = getDB(request);
    const r = await db.prepare(
      `INSERT INTO organizations (nome,tipo,cidade,estado,cnpj,responsavel,email,created_at)
       VALUES (?,?,?,?,?,?,?,datetime('now'))`
    ).bind(nome.trim(), tipo||"clinica", cidade||null, estado||null, cnpj||null, responsavel||null, email||null).run();
    const orgId = r.meta?.last_row_id;
    await db.prepare(
      `INSERT OR IGNORE INTO org_members (org_id,user_id,role,joined_at) VALUES (?,?,'admin',datetime('now'))`
    ).bind(orgId, userId).run();
    return Response.json({ success: true, id: orgId });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
