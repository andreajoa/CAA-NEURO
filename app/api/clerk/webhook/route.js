import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    const body = await request.text();

    if (process.env.CLERK_WEBHOOK_SECRET && svix_signature) {
      const { Webhook } = await import("svix");
      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      try {
        wh.verify(body, { "svix-id": svix_id, "svix-timestamp": svix_timestamp, "svix-signature": svix_signature });
      } catch {
        return Response.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const { type, data } = JSON.parse(body);

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";

      await d1Query(
        `INSERT INTO users (id, user_id, email, plano, created_at)
         VALUES (?, ?, ?, 'gratuito', datetime('now'))
         ON CONFLICT(id) DO UPDATE SET email=excluded.email`,
        [clerkId, clerkId, email]
      );

      console.log(`✅ Usuário sincronizado: ${clerkId} ${email}`);
    }

    return Response.json({ received: true });
  } catch (e) {
    console.error("Clerk webhook error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
