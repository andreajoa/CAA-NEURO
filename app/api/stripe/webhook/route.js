import Stripe from "stripe";
import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  let event;
  try {
    event = process.env.STRIPE_WEBHOOK_SECRET
      ? stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
      : JSON.parse(body);
  } catch (e) {
    return Response.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
  }

  const session = event.data?.object;
  const userId = session?.metadata?.userId || session?.client_reference_id;
  const plano = session?.metadata?.plano || "individual";
  const maxProf = parseInt(session?.metadata?.max_prof || "1");
  const maxPac = parseInt(session?.metadata?.max_pac || "50");

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.updated": {
        if (!userId) break;
        const expira = new Date();
        expira.setMonth(expira.getMonth() + 1);

        if (plano === "individual") {
          await d1Query(
            `INSERT INTO users (id, plano, plano_expira) VALUES (?, 'pro', ?)
             ON CONFLICT(id) DO UPDATE SET plano='pro', plano_expira=?`,
            [userId, expira.toISOString(), expira.toISOString()]
          );
        } else {
          // Plano clínica ou instituição — ativa/atualiza org do admin
          const membership = await d1Query(
            "SELECT org_id FROM org_members WHERE user_id=? AND role='admin' LIMIT 1", [userId]
          );
          if (membership?.length) {
            const orgId = membership[0].org_id;
            await d1Query(
              "UPDATE organizations SET plano=?, ativo=1, max_profissionais=?, max_pacientes=? WHERE id=?",
              [plano, maxProf, maxPac, orgId]
            );
            await d1Query(
              `INSERT INTO users (id, plano, plano_expira, org_id) VALUES (?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET plano=?, plano_expira=?, org_id=?`,
              [userId, plano, expira.toISOString(), orgId, plano, expira.toISOString(), orgId]
            );
          }
        }
        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        if (!userId) break;
        await d1Query(
          `INSERT INTO users (id, plano) VALUES (?, 'gratuito')
           ON CONFLICT(id) DO UPDATE SET plano='gratuito', plano_expira=NULL`,
          [userId]
        );
        // Desativar org se era admin
        const membership = await d1Query(
          "SELECT org_id FROM org_members WHERE user_id=? AND role='admin' LIMIT 1", [userId]
        );
        if (membership?.length) {
          await d1Query("UPDATE organizations SET ativo=0 WHERE id=?", [membership[0].org_id]);
        }
        break;
      }
    }
  } catch (e) {
    console.error("Webhook DB error:", e.message);
  }
  return Response.json({ received: true });
}
