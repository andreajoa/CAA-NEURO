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
      const nome = data.first_name || "novo membro";

      await d1Query(
        `INSERT INTO users (id, user_id, email, plano, created_at)
         VALUES (?, ?, ?, 'gratuito', datetime('now'))
         ON CONFLICT(id) DO UPDATE SET email=excluded.email`,
        [clerkId, clerkId, email]
      );

      console.log(`✅ Usuário sincronizado: ${clerkId} ${email}`);

      // Adiciona na Audience do Resend
      if (email) {
        await fetch("https://api.resend.com/audiences/086dc134-c602-45ff-b3f3-43fb06042eeb/contacts", {
          method: "POST",
          headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, first_name: nome, unsubscribed: false }),
        }).catch(e => console.error("Resend audience error:", e.message));

        // Envia email direto
        if (type === "user.created") {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "CAA Neuro <noreply@adhdautism.online>",
              to: email,
              subject: "Toda pessoa merece ser compreendida. Sua jornada começa agora.",
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F2E8E1;padding:24px"><div style="background:#fff;padding:40px"><div style="text-align:center;border-bottom:2px solid #C76B4A;padding-bottom:20px;margin-bottom:30px"><h1 style="color:#1B2D5B;font-size:28px;margin:0">&#129504; <span style="color:#C76B4A">CAA</span> Neuro</h1></div><h2 style="color:#1B2D5B;font-size:22px">Toda pessoa merece ser compreendida.</h2><p style="color:#405047;font-size:16px;line-height:1.6">Olá ${nome},</p><p style="color:#405047;font-size:16px;line-height:1.6">Se você é como a maioria dos profissionais e familiares que chegam até aqui, você sabe a frustração de ver alguém querendo se expressar, mas não conseguindo.</p><p style="color:#405047;font-size:16px;line-height:1.6">Foi exatamente por enxergar essa lacuna que a <strong>Margareth Almeida</strong> (Psicopedagoga) decidiu criar o CAA Neuro.</p><p style="color:#405047;font-size:16px;line-height:1.6"><strong style="color:#1d9e75">O CAA Neuro é 100% gratuito.</strong> Sem taxas escondidas, sem teste de 7 dias.</p><div style="background:#F2E8E1;border-left:4px solid #C76B4A;padding:20px;margin:24px 0"><p style="color:#1B2D5B;font-size:16px;margin-top:0"><strong>O que você acabou de desbloquear:</strong></p><ul style="color:#405047;font-size:15px;line-height:1.8"><li><strong>Pranchoteca Inteligente:</strong> Crie pranchas em minutos.</li><li><strong>Voz que Traduz:</strong> Ouça em 6 idiomas.</li><li><strong>IA de Pictogramas:</strong> Cria pictogramas exclusivos na hora.</li><li><strong>Gestão Completa:</strong> Pacientes, sessões e PDFs profissionais.</li></ul></div><div style="text-align:center;margin:36px 0"><a href="https://www.adhdautism.online/" style="background:#1d9e75;color:white;padding:16px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:18px;display:inline-block">Entrar no App Agora</a></div><p style="color:#405047;font-size:16px">Com propósito e gratidão,<br><br><strong>Margareth Almeida</strong><br><span style="font-size:14px;color:#888">Psicopedagoga · Idealizadora do CAA Neuro</span></p></div><div style="background:#1B2D5B;padding:24px;text-align:center"><p style="color:#a0aec0;font-size:13px;margin:0"><strong style="color:#fff">CAA Neuro</strong> · adhdautism.online</p></div></div>`,
            }),
          }).then(r => r.json()).then(r => console.log("✅ Email enviado:", JSON.stringify(r))).catch(e => console.error("Email error:", e.message));
        }
      }
    }

    return Response.json({ received: true });
  } catch (e) {
    console.error("Clerk webhook error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
