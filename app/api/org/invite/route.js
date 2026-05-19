import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../../lib/d1";
import { sendAlertEmail } from "../../../../lib/sendAlertEmail";

export const runtime = "nodejs";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { org_id, email, role } = await request.json();
    if (!org_id || !email) return Response.json({ error: "org_id e email obrigatórios" }, { status: 400 });

    // Verificar se o usuário é admin da org
    const member = await d1Query(
      "SELECT role FROM org_members WHERE org_id=? AND user_id=? AND role='admin'",
      [org_id, userId]
    );
    if (!member?.length) return Response.json({ error: "Apenas administradores podem convidar membros" }, { status: 403 });

    const org = await d1Query("SELECT nome FROM organizations WHERE id=?", [org_id]);
    const orgNome = org?.[0]?.nome || "sua organização";

    // Gerar token único
    const token = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await d1Query(
      `INSERT OR REPLACE INTO org_invites (org_id, email, role, token, usado, expires_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [org_id, email, role || "profissional", token, expires.toISOString()]
    );

    const inviteUrl = `https://www.adhdautism.online/aceitar-convite?token=${token}`;

    await sendAlertEmail({
      subject: `Convite para ${orgNome} — CAA Neuro`,
      message: `Você foi convidado para integrar a equipe de ${orgNome} no CAA Neuro como ${role || "profissional"}.\n\nAcesse o link abaixo para aceitar o convite (válido por 7 dias):\n${inviteUrl}\n\nSe você não esperava este convite, ignore este email.`,
      to: email,
    }).catch(() => {});

    return Response.json({ success: true, token, invite_url: inviteUrl });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
