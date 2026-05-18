import { auth } from "@clerk/nextjs/server";
export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const start = Date.now();
  const checks = {};
  let allOk = true;

  try {
    const db = getDB(request);
    await db.prepare("SELECT 1").first();
    checks.database = { ok: true, ms: Date.now() - start };
  } catch (e) {
    checks.database = { ok: false, error: e.message };
    allOk = false;
  }

  checks.encryption = { ok: !!process.env.ENCRYPTION_KEY };
  checks.clerk = { ok: !!process.env.CLERK_SECRET_KEY };
  checks.uptime = process.uptime ? Math.floor(process.uptime()) : null;
  checks.timestamp = new Date().toISOString();

  if (!allOk) {
    try {
      const resend = process.env.RESEND_API_KEY;
      if (resend) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resend}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "alertas@caa-neuro.com.br",
            to: "tdahma2@gmail.com",
            subject: "⚠️ CAA Neuro — Falha detectada",
            html: `<h2>Alerta automático CAA Neuro</h2><pre>${JSON.stringify(checks, null, 2)}</pre><p>Verifique imediatamente.</p>`
          })
        });
      }
    } catch {}
  }

  return Response.json({ status: allOk ? "ok" : "degraded", checks }, {
    status: allOk ? 200 : 503
  });
}
