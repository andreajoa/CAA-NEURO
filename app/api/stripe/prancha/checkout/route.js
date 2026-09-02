import Stripe from "stripe";
import { NextResponse } from "next/server";
import {
  PRANCHA_CURRENCY,
  PRANCHA_PRICE_CENTS,
  PRANCHA_PRODUCT_NAME,
  PRANCHA_PRODUCT_SLUG,
} from "../../../../../lib/pranchaStripe";

export const runtime = "nodejs";

export async function POST(request) {
  const secretKey = process.env.PRANCHA_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe não configurado.", debug: { hasKey: false } },
      { status: 503 }
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PRANCHA_CURRENCY,
            unit_amount: PRANCHA_PRICE_CENTS,
            product_data: {
              name: PRANCHA_PRODUCT_NAME,
            },
          },
        },
      ],
      metadata: {
        productSlug: PRANCHA_PRODUCT_SLUG,
      },
      return_url: `${origin}/prancha/obrigado?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json(
      { clientSecret: session.client_secret },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PRANCHA CHECKOUT ERROR", error?.type, error?.code, error?.message);

    return NextResponse.json(
      {
        error: "Não foi possível abrir o pagamento. Tente novamente em instantes.",
        debug: {
          type: error?.type,
          code: error?.code,
          message: error?.message,
          keyPrefix: secretKey.substring(0, 12),
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
