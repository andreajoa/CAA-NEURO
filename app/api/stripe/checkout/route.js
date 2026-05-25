import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANOS = {
  individual:  { price: process.env.STRIPE_PRICE_ID,            max_prof: 1,  max_pac: 50,  label: "Individual" },
  clinica:     { price: process.env.STRIPE_PRICE_ID_CLINICA,    max_prof: 5,  max_pac: 200, label: "Clínica" },
  instituicao: { price: process.env.STRIPE_PRICE_ID_INSTITUICAO,max_prof: 20, max_pac: 999, label: "Instituição" },
};

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";
    const origin = request.headers.get("origin") || "https://www.adhdautism.online";
    const body = await request.json().catch(() => ({}));
    const plano = PLANOS[body.plano] ? body.plano : "individual";
    const priceId = PLANOS[plano].price;
    const embedded = body.embedded === true;

    const meta = { userId, plano, max_prof: String(PLANOS[plano].max_prof), max_pac: String(PLANOS[plano].max_pac) };

    if (embedded) {
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded_page",
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        return_url: `${origin}/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: email || undefined,
        metadata: meta,
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
      metadata: meta,
      locale: "pt-BR",
      allow_promotion_codes: true,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("STRIPE CHECKOUT ERROR:", e.message, e.stack); return Response.json({ error: e.message, detail: e.type || e.code || "" }, { status: 500 });
  }
}
