import { NextResponse } from "next/server";
import {
  getPranchaStripe,
  PRANCHA_PRODUCT_SLUG,
} from "../../../../../lib/pranchaStripe";

export const runtime = "nodejs";

export async function POST(request) {
  const webhookSecret = process.env.PRANCHA_STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  }

  const body = await request.text();
  let event;

  try {
    const stripe = getPranchaStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const completedEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ]);

  if (completedEvents.has(event.type)) {
    const session = event.data.object;
    if (session?.object === "checkout.session") {
      if (session.metadata?.productSlug === PRANCHA_PRODUCT_SLUG) {
        console.info("PRANCHA PURCHASE CONFIRMED", {
          sessionId: session.id,
          paymentStatus: session.payment_status,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
