import Stripe from "stripe";
import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

async function activatePlan(metadata = {}) {
  const userId = metadata.userId;
  if (!userId) return;

  const plano = metadata.plano || "individual";
  const maxProf = Number.parseInt(metadata.max_prof || "1", 10);
  const maxPac = Number.parseInt(metadata.max_pac || "50", 10);
  const expira = new Date();
  expira.setMonth(expira.getMonth() + 1);

  if (plano === "individual") {
    await d1Query(
      `INSERT INTO users (id, plano, plano_expira) VALUES (?, 'pro', ?)
       ON CONFLICT(id) DO UPDATE SET plano='pro', plano_expira=?`,
      [userId, expira.toISOString(), expira.toISOString()]
    );
    return;
  }

  const membership = await d1Query(
    "SELECT org_id FROM org_members WHERE user_id=? AND role='admin' LIMIT 1", [userId]
  );
  if (!membership?.length) return;

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

async function deactivatePlan(metadata = {}) {
  const userId = metadata.userId;
  if (!userId) return;

  await d1Query(
    `INSERT INTO users (id, plano) VALUES (?, 'gratuito')
     ON CONFLICT(id) DO UPDATE SET plano='gratuito', plano_expira=NULL`,
    [userId]
  );
  const membership = await d1Query(
    "SELECT org_id FROM org_members WHERE user_id=? AND role='admin' LIMIT 1", [userId]
  );
  if (membership?.length) {
    await d1Query("UPDATE organizations SET ativo=0 WHERE id=?", [membership[0].org_id]);
  }
}

export async function POST(request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Credenciais do webhook Stripe não configuradas");
    return Response.json({ error: "Webhook indisponível" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return Response.json({ error: "Assinatura ausente" }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return Response.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await activatePlan({
          ...session.metadata,
          userId: session.metadata?.userId || session.client_reference_id,
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        if (["active", "trialing"].includes(subscription.status)) {
          await activatePlan(subscription.metadata);
        }
        break;
      }
      case "customer.subscription.deleted": {
        await deactivatePlan(event.data.object.metadata);
        break;
      }
    }
  } catch (e) {
    console.error("Webhook DB error:", e.message);
    return Response.json({ error: "Falha ao processar assinatura" }, { status: 500 });
  }
  return Response.json({ received: true });
}
