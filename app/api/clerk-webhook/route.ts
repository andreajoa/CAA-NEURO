import { NextResponse, NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

export async function POST(req: NextRequest) {
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

      console.log("Novo usuario: " + email + ". Adicionando na Audience do Resend...");

      const contactRes = await fetch("https://api.resend.com/audiences/086dc134-c602-45ff-b3f3-43fb06042eeb/contacts", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.RESEND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          first_name: nome,
          unsubscribed: false,
        }),
      });

      const contactData = await contactRes.text();
      console.log("Resposta Resend: " + contactRes.status + " " + contactData);

      if (!contactRes.ok) {
        console.error("Erro ao adicionar contato:", contactData);
        return NextResponse.json({ error: "Falha contato" }, { status: 500 });
      }

      console.log("Contato adicionado com sucesso na Audience para " + email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return NextResponse.json({ error: "Erro no webhook" }, { status: 400 });
  }
}
