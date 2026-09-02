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
    return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
  }

  const origin = (
    process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  ).replace(/\/$/, "");

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2026-03-25.dahlia",
      },
      body: new URLSearchParams({
        mode: "payment",
        "ui_mode": "embedded_page",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": PRANCHA_CURRENCY,
        "line_items[0][price_data][unit_amount]": String(PRANCHA_PRICE_CENTS),
        "line_items[0][price_data][product_data][name]": PRANCHA_PRODUCT_NAME,
        "metadata[productSlug]": PRANCHA_PRODUCT_SLUG,
        return_url: `${origin}/prancha/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("STRIPE API ERROR", data.error?.type, data.error?.message);
      return NextResponse.json(
        {
          error: "Não foi possível abrir o pagamento.",
          debug: { stripeError: data.error?.message, type: data.error?.type },
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { clientSecret: data.client_secret },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PRANCHA CHECKOUT FETCH ERROR", error.message);
    return NextResponse.json(
      {
        error: "Não foi possível abrir o pagamento.",
        debug: { fetchError: error.message },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
