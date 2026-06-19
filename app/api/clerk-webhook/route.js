export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const { email_addresses, first_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const nome = first_name || "novo membro";

      if (!email) {
        console.error("Email nao encontrado");
        return NextResponse.json({ success: true });
      }

      console.log("Adicionando contato e enviando email para: " + email);

      await fetch("https://api.resend.com/audiences/086dc134-c602-45ff-b3f3-43fb06042eeb/contacts", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.RESEND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, first_name: nome, unsubscribed: false }),
      });

      const { error } = await resend.emails.send({
        from: "CAA Neuro <noreply@adhdautism.online>",
        to: email,
        subject: "Toda pessoa merece ser compreendida. Sua jornada comeca agora.",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F2E8E1;padding:24px"><div style="background:#fff;padding:40px"><div style="text-align:center;border-bottom:2px solid #C76B4A;padding-bottom:20px;margin-bottom:30px"><h1 style="color:#1B2D5B;font-size:28px;margin:0">&#129504; <span style="color:#C76B4A">CAA</span> Neuro</h1></div><h2 style="color:#1B2D5B;font-size:22px">Toda pessoa merece ser compreendida.</h2><p style="color:#405047;font-size:16px;line-height:1.6">Ola ${nome},</p><p style="color:#405047;font-size:16px;line-height:1.6">Se voce e como a maioria dos profissionais e familiares que chegam ate aqui, voce sabe a frustracao de ver alguem querendo se expressar, mas nao conseguindo.</p><p style="color:#405047;font-size:16px;line-height:1.6">Foi exatamente por enxergar essa lacuna que a <strong>Margareth Almeida</strong> (Psicopedagoga) decidiu criar o CAA Neuro.</p><p style="color:#405047;font-size:16px;line-height:1.6"><strong style="color:#1d9e75">O CAA Neuro e 100% gratuito.</strong> Sem taxas escondidas, sem teste de 7 dias.</p><div style="background:#F2E8E1;border-left:4px solid #C76B4A;padding:20px;margin:24px 0"><p style="color:#1B2D5B;font-size:16px;margin-top:0"><strong>O que voce acaba de desbloquear:</strong></p><ul style="color:#405047;font-size:15px;line-height:1.8"><li><strong>Pranchoteca Inteligente:</strong> Crie pranchas em minutos.</li><li><strong>Voz que Traduz:</strong> Ouca em 6 idiomas.</li><li><strong>IA de Pictogramas:</strong> Cria pictogramas exclusivos na hora.</li><li><strong>Gestao Completa:</strong> Pacientes, sessoes e PDFs profissionais.</li></ul></div><div style="text-align:center;margin:36px 0"><a href="https://www.adhdautism.online/" style="background:#1d9e75;color:white;padding:16px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:18px;display:inline-block">Entrar no App Agora</a></div><p style="color:#405047;font-size:16px">Com proposito e gratidao,<br><br><strong>Margareth Almeida</strong><br><span style="font-size:14px;color:#888">Psicopedagoga · Idealizadora do CAA Neuro</span></p></div><div style="background:#1B2D5B;padding:24px;text-align:center"><p style="color:#a0aec0;font-size:13px;margin:0"><strong style="color:#fff">CAA Neuro</strong> · adhdautism.online</p></div></div>`,
      });

      if (error) {
        console.error("Erro ao enviar email:", JSON.stringify(error));
        return NextResponse.json({ error: "Falha email" }, { status: 500 });
      }

      console.log("Email enviado com sucesso para " + email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return NextResponse.json({ error: "Erro no webhook" }, { status: 400 });
  }
}
