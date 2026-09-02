import Stripe from "stripe";

export const PRANCHA_PRODUCT_SLUG = "complete-com-a-silaba";
export const PRANCHA_PRODUCT_NAME = "Complete com a Sílaba | 50 fichas com velcro";
export const PRANCHA_PRICE_CENTS = 990;
export const PRANCHA_CURRENCY = "brl";

let stripeClient;

export function getPranchaStripe() {
  const secretKey = process.env.PRANCHA_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe não configurado para o material Complete com a Sílaba.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      maxNetworkRetries: 3,
      timeout: 20000,
      appInfo: {
        name: "CAA Neuro | Prancha",
        version: "1.0.0",
      },
    });
  }

  return stripeClient;
}

export function isPaidPranchaSession(session) {
  return Boolean(
    session &&
    session.mode === "payment" &&
    session.payment_status === "paid" &&
    session.metadata?.productSlug === PRANCHA_PRODUCT_SLUG
  );
}
