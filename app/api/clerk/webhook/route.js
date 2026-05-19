import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "user.created" || type === "user.updated") {
      const userId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";
      const nome = `${data.first_name || ""} ${data.last_name || ""}`.trim();

      await d1Query(
        `INSERT INTO users (user_id, plano, created_at)
         VALUES (?, 'gratuito', datetime('now'))
         ON CONFLICT(user_id) DO UPDATE SET user_id=user_id`,
        [userId]
      );

      console.log(`✅ Usuário registrado: ${userId} ${email}`);
    }

    return Response.json({ received: true });
  } catch (e) {
    console.error("Clerk webhook error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
