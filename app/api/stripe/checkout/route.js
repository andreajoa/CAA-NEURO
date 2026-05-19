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
    console.error("Stripe checkout error:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
