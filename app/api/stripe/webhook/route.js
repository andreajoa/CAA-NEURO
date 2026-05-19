import Stripe from "stripe";
import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(body, sig, webhookSecret)
      : JSON.parse(body);
  } catch (e) {
    return Response.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
  }

  const session = event.data?.object;
  const userId = session?.metadata?.userId || session?.client_reference_id;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.updated":
        if (userId) {
          const expira = new Date();
          expira.setMonth(expira.getMonth() + 1);
          await d1Query(
            "INSERT INTO users (user_id, plano, plano_expira) VALUES (?, 'pro', ?) ON CONFLICT(user_id) DO UPDATE SET plano='pro', plano_expira=?",
            [userId, expira.toISOString(), expira.toISOString()]
          );
        }
        break;
      case "customer.subscription.deleted":
      case "invoice.payment_failed":
        if (userId) {
          await d1Query(
            "INSERT INTO users (user_id, plano) VALUES (?, 'gratuito') ON CONFLICT(user_id) DO UPDATE SET plano='gratuito', plano_expira=NULL",
            [userId]
          );
        }
        break;
    }
  } catch (e) {
    console.error("Webhook DB error:", e.message);
  }

  return Response.json({ received: true });
}
