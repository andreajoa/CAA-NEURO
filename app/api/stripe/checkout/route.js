import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const PLANOS = {
  individual:  { price: process.env.STRIPE_PRICE_ID,            max_prof: 1,  max_pac: 50,  label: "Individual" },
  clinica:     { price: process.env.STRIPE_PRICE_ID_CLINICA,    max_prof: 5,  max_pac: 200, label: "Clínica" },
  instituicao: { price: process.env.STRIPE_PRICE_ID_INSTITUICAO,max_prof: 20, max_pac: 999, label: "Instituição" },
};

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Pagamento temporariamente indisponível" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";
    const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const body = await request.json().catch(() => ({}));
    const plano = PLANOS[body.plano] ? body.plano : "individual";
    const priceId = PLANOS[plano].price;
    const embedded = body.embedded === true;

    if (!priceId) {
      return Response.json({ error: `Preço do plano ${plano} não configurado` }, { status: 503 });
    }

    const meta = { userId, plano, max_prof: String(PLANOS[plano].max_prof), max_pac: String(PLANOS[plano].max_pac) };

    if (embedded) {
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded_page",
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        return_url: `${origin}/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: email || undefined,
        client_reference_id: userId,
        metadata: meta,
        subscription_data: { metadata: meta },
        locale: "pt-BR",
        allow_promotion_codes: true,
      });
      return Response.json({ clientSecret: session.client_secret });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/planos`,
      customer_email: email || undefined,
      client_reference_id: userId,
      metadata: meta,
      subscription_data: { metadata: meta },
      locale: "pt-BR",
      allow_promotion_codes: true,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("STRIPE CHECKOUT ERROR:", e.message);
    return Response.json({ error: "Não foi possível iniciar o pagamento" }, { status: 500 });
  }
}
