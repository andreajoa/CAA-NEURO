import { redirect } from "next/navigation";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { Check, Download, Heart, ShieldCheck } from "lucide-react";
import { getPranchaStripe, isPaidPranchaSession } from "../../../lib/pranchaStripe";
import styles from "./obrigado.module.css";

export const metadata = {
  title: "Obrigado pela compra | Margareth Almeida",
  robots: { index: false, follow: false },
};

export default async function ObrigadoPage({ searchParams }) {
  const params = await searchParams;
  const sessionId = params?.session_id;

  if (!sessionId || !sessionId.startsWith("cs_")) {
    redirect("/prancha");
  }

  let paid = false;
  let customerEmail = "";

  try {
    const stripe = getPranchaStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    paid = isPaidPranchaSession(session);
    customerEmail = session.customer_details?.email || "";
  } catch {
    paid = false;
  }

  if (!paid) {
    return (
      <main className={`${styles.page} ${GeistSans.className}`}>
        <div className={styles.card}>
          <div className={styles.iconWrap} data-state="pending">
            <ShieldCheck />
          </div>
          <h1>Pagamento pendente</h1>
          <p>O pagamento ainda não foi confirmado. Se você acabou de pagar, aguarde alguns instantes e recarregue esta página.</p>
          <div className={styles.actions}>
            <a href={`/prancha/obrigado?session_id=${sessionId}`} className={styles.primaryBtn}>
              Recarregar
            </a>
            <Link href="/prancha" className={styles.secondaryBtn}>
              Voltar para a página
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${GeistSans.className}`}>
      <div className={styles.card}>
        <div className={styles.iconWrap} data-state="success">
          <Check strokeWidth={3} />
        </div>
        <h1>Compra confirmada!</h1>
        <p>
          {customerEmail
            ? <>Enviamos a confirmação para <strong>{customerEmail}</strong>.</>
            : "Sua compra foi confirmada com sucesso."}
        </p>

        <div className={styles.downloadBox}>
          <Heart className={styles.heart} />
          <h2>Complete com a Sílaba</h2>
          <p>50 fichas reutilizáveis + sílabas móveis para velcro</p>
          <a
            href={`/api/stripe/prancha/download?session_id=${sessionId}`}
            className={styles.downloadBtn}
          >
            <Download />
            Baixar material (ZIP)
          </a>
          <span className={styles.hint}>Dois PDFs prontos para imprimir em A4</span>
        </div>

        <div className={styles.legal}>
          <ShieldCheck />
          <span>
            Material de Margareth Almeida, Neuropsicopedagoga. Uso permitido pelo comprador.
            Revenda, compartilhamento e comercialização por terceiros são proibidos.
          </span>
        </div>

        <Link href="/prancha" className={styles.backLink}>
          Voltar para a página do material
        </Link>
      </div>
    </main>
  );
}
