import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ plano: "gratuito" });
  try {
    const rows = await d1Query(
      "SELECT plano, plano_expira, org_id, role FROM users WHERE id=?",
      [userId]
    );
    const user = rows?.[0];
    if (!user) return Response.json({ plano: "gratuito", role: "profissional" });

    if (user.plano === "pro" && user.plano_expira) {
      if (new Date(user.plano_expira) < new Date()) {
        await d1Query("UPDATE users SET plano='gratuito' WHERE id=?", [userId]);
        return Response.json({ plano: "gratuito", expirado: true, role: user.role });
      }
    }

    // Se está em uma org, o plano é institucional
    if (user.org_id) {
      const org = await d1Query("SELECT plano, nome FROM organizations WHERE id=? AND ativo=1", [user.org_id]);
      if (org?.[0]) {
        return Response.json({
          plano: "institucional",
          org_id: user.org_id,
          org_nome: org[0].nome,
          role: user.role || "profissional",
        });
      }
    }

    return Response.json({
      plano: user.plano || "gratuito",
      plano_expira: user.plano_expira,
      role: user.role || "profissional",
      org_id: user.org_id || null,
    });
  } catch (e) {
    return Response.json({ plano: "gratuito", role: "profissional" });
  }
}
