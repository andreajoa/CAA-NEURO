import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";
import { isAdmin } from "../../../lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ plano: "gratuito" });

  if (isAdmin(userId)) {
    return Response.json({ plano: "admin", is_admin: true });
  }

  try {
    const rows = await d1Query("SELECT plano, plano_expira FROM users WHERE id=?", [userId]);
    const user = rows?.[0];
    if (!user) return Response.json({ plano: "gratuito" });
    if (user.plano === "pro" && user.plano_expira) {
      const expira = new Date(user.plano_expira);
      if (expira < new Date()) {
        await d1Query("UPDATE users SET plano='gratuito' WHERE id=?", [userId]);
        return Response.json({ plano: "gratuito", expirado: true });
      }
    }
    return Response.json({ plano: user.plano || "gratuito", plano_expira: user.plano_expira });
  } catch (e) {
    return Response.json({ plano: "gratuito" });
  }
}
