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
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }
    const allowedRoles = ["member", "profissional"];
    const inviteRole = allowedRoles.includes(role) ? role : "profissional";

    // Verificar se o usuário é admin da org
    const member = await d1Query(
      `SELECT m.role, o.nome, o.ativo, o.max_profissionais
       FROM org_members m INNER JOIN organizations o ON o.id=m.org_id
       WHERE m.org_id=? AND m.user_id=? AND m.role='admin'`,
      [org_id, userId]
    );
    if (!member?.length) return Response.json({ error: "Apenas administradores podem convidar membros" }, { status: 403 });
    if (!member[0].ativo) return Response.json({ error: "Ative um plano Clínica ou Instituição antes de convidar a equipe" }, { status: 403 });

    const count = await d1Query("SELECT COUNT(*) AS total FROM org_members WHERE org_id=? AND ativo!=0", [org_id]);
    const maxProfessionals = Number(member[0].max_profissionais || 1);
    if (Number(count?.[0]?.total || 0) >= maxProfessionals) {
      return Response.json({ error: `Limite de ${maxProfessionals} profissionais atingido` }, { status: 403 });
    }
    const orgNome = member[0].nome || "sua organização";

    // Gerar token único
    const token = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    await d1Query(
      `INSERT OR REPLACE INTO org_invites (org_id, email, role, token, usado, expires_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [org_id, normalizedEmail, inviteRole, token, expires.toISOString()]
    );

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const inviteUrl = `${appUrl}/aceitar-convite?token=${token}`;

    await sendAlertEmail({
      subject: `Convite para ${orgNome} — CAA Neuro`,
      message: `Você foi convidado para integrar a equipe de ${orgNome} no CAA Neuro como ${inviteRole}.\n\nAcesse o link abaixo para aceitar o convite (válido por 7 dias):\n${inviteUrl}\n\nSe você não esperava este convite, ignore este email.`,
      to: normalizedEmail,
    }).catch(() => {});

    return Response.json({ success: true, token, invite_url: inviteUrl });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
