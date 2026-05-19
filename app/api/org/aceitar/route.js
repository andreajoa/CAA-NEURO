import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { token } = await request.json();
    if (!token) return Response.json({ error: "Token obrigatório" }, { status: 400 });

    const invite = await d1Query(
      "SELECT * FROM org_invites WHERE token=? AND usado=0 AND expires_at > datetime('now')",
      [token]
    );
    if (!invite?.length) return Response.json({ error: "Convite inválido ou expirado." }, { status: 400 });

    const inv = invite[0];
    const org = await d1Query("SELECT nome FROM organizations WHERE id=?", [inv.org_id]);

    await d1Query(
      "INSERT OR IGNORE INTO org_members (org_id, user_id, role, joined_at) VALUES (?, ?, ?, datetime('now'))",
      [inv.org_id, userId, inv.role]
    );

    await d1Query("UPDATE org_invites SET usado=1 WHERE token=?", [token]);
    await d1Query("UPDATE users SET org_id=?, role=? WHERE id=?", [inv.org_id, inv.role, userId]);

    return Response.json({ success: true, org_nome: org?.[0]?.nome || "organização" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
