import { NextResponse, NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

      console.log("Novo usuario: " + email + ". Disparando evento no Resend...");

      const { data, error } = await resend.events.send({
        event: "Contact added to audience",
        email: email,
      });

      if (error) {
        console.error("Erro Resend:", JSON.stringify(error));
        return NextResponse.json({ error: "Falha evento" }, { status: 500 });
      }

      console.log("Evento disparado com sucesso para " + email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return NextResponse.json({ error: "Erro no webhook" }, { status: 400 });
  }
}
