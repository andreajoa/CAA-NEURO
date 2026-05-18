export const runtime = "nodejs";

export async function GET(request) {
  const checks = {};
  let allOk = true;

  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
    const token = process.env.CLOUDFLARE_D1_API_TOKEN;

    const start = Date.now();
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sql: "SELECT 1 as ok" }),
      }
    );
    const data = await res.json();
    const dbOk = data?.success === true;
    checks.database = { ok: dbOk, ms: Date.now() - start };
    if (!dbOk) allOk = false;
  } catch (e) {
    checks.database = { ok: false, error: e.message };
    allOk = false;
  }

  checks.encryption = { ok: !!process.env.ENCRYPTION_KEY };
  checks.clerk = { ok: !!process.env.CLERK_SECRET_KEY };
  checks.timestamp = new Date().toISOString();

  if (!allOk) {
    const resend = process.env.RESEND_API_KEY;
    if (resend) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resend}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "alertas@adhdautism.online",
          to: "tdahma2@gmail.com",
          subject: "⚠️ CAA Neuro — Falha detectada",
          html: `<h2>Alerta CAA Neuro</h2><pre>${JSON.stringify(checks, null, 2)}</pre>`,
        }),
      }).catch(() => {});
    }
  }

  return Response.json({ status: allOk ? "ok" : "degraded", checks }, {
    status: allOk ? 200 : 503,
  });
}
