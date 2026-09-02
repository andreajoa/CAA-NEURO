"use client";

import { useMemo, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { LockKeyhole } from "lucide-react";
import styles from "../prancha.module.css";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export default function EmbeddedProductCheckout() {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const options = useMemo(() => (clientSecret ? { clientSecret } : undefined), [clientSecret]);

  async function openCheckout() {
    if (!stripePromise) {
      setError("O pagamento ainda não está configurado. Tente novamente em instantes.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/prancha/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || "Não foi possível abrir o pagamento.");
      }

      setClientSecret(data.clientSecret);
      window.requestAnimationFrame(() => {
        document.getElementById("checkout-embedded")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (checkoutError) {
      setError(checkoutError.message || "Não foi possível abrir o pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="checkout-embedded" className={styles.checkoutShell}>
      {!clientSecret && !loading && (
        <div className={styles.checkoutIntro}>
          <button type="button" className={styles.checkoutButton} onClick={openCheckout}>
            Quero o material
          </button>
          <p><LockKeyhole aria-hidden="true" /> Checkout seguro processado pela Stripe.</p>
          {error && <div className={styles.checkoutError} role="alert">{error}</div>}
        </div>
      )}

      {loading && (
        <div className={styles.checkoutLoading} aria-live="polite">
          <span />
          <span />
          <span />
          <p>Preparando o checkout seguro...</p>
        </div>
      )}

      {clientSecret && options && stripePromise && (
        <div className={styles.checkoutFrame}>
          <EmbeddedCheckoutProvider key={clientSecret} stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}
    </div>
  );
}
