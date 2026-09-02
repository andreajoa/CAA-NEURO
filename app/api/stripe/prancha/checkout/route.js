import { NextResponse } from "next/server";
import {
  getPranchaStripe,
  PRANCHA_CURRENCY,
  PRANCHA_PRICE_CENTS,
  PRANCHA_PRODUCT_NAME,
  PRANCHA_PRODUCT_SLUG,
} from "../../../../../lib/pranchaStripe";

export const runtime = "nodejs";

function getBaseUrl(request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL;
  return (configured || new URL(request.url).origin).replace(/\/$/, "");
}

export async function POST(request) {
  try {
    const stripe = getPranchaStripe();
    const baseUrl = getBaseUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      locale: "pt-BR",
      customer_creation: "always",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PRANCHA_CURRENCY,
            unit_amount: PRANCHA_PRICE_CENTS,
            product_data: {
              name: PRANCHA_PRODUCT_NAME,
              description: "Dois PDFs em A4: 50 fichas reutilizáveis, gabarito, acompanhamento e sílabas móveis.",
              metadata: {
                productSlug: PRANCHA_PRODUCT_SLUG,
              },
            },
          },
        },
      ],
      metadata: {
        productSlug: PRANCHA_PRODUCT_SLUG,
        productVersion: "2026-09",
        fulfillment: "digital-download",
      },
      return_url: `${baseUrl}/prancha/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      integration_identifier: "prancha_lyvmbqaz",
    });

    return NextResponse.json(
      { clientSecret: session.client_secret },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PRANCHA CHECKOUT ERROR", {
      type: error?.type,
      code: error?.code,
      message: error?.message,
    });

    return NextResponse.json(
      {
        error: "Não foi possível abrir o pagamento. Tente novamente em instantes.",
        debug: {
          type: error?.type,
          code: error?.code,
          message: error?.message,
          hasKey: Boolean(process.env.PRANCHA_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY),
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
