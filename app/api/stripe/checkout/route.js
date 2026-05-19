import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || "";
    const origin = request.headers.get("origin") || "https://www.adhdautism.online";
    const body = await request.json().catch(() => ({}));
    const embedded = body.embedded === true;

    if (embedded) {
      // Modo embedded: retorna client_secret para renderizar dentro da página
      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        return_url: `${origin}/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: email || undefined,
        metadata: { userId },
        locale: "pt-BR",
        allow_promotion_codes: true,
      });
      return Response.json({ clientSecret: session.client_secret });
    }

    // Modo redirect (fallback)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/upgrade/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/planos`,
      customer_email: email || undefined,
      metadata: { userId },
      locale: "pt-BR",
      allow_promotion_codes: true,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
