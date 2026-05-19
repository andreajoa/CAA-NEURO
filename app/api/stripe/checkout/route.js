import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const email = sessionClaims?.email || sessionClaims?.primary_email_address || "";
    const origin = request.headers.get("origin") || "https://www.adhdautism.online";

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

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
