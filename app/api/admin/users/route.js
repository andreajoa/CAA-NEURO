import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../../lib/d1";
import { isAdmin } from "../../../../lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) return Response.json({ error: "Acesso negado" }, { status: 403 });
  try {
    const users = await d1Query(
      "SELECT id, email, plano, plano_expira, created_at FROM users ORDER BY created_at DESC"
    );
    return Response.json({ users: users || [] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
