import { auth } from "@clerk/nextjs/server";
export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function POST(request) {
  const { userId } = await auth().catch(() => ({ userId: null }));
  try {
    const { tipo, mensagem, severidade } = await request.json();
    const db = getDB(request);
    await db.prepare(
      `INSERT INTO audit_logs (user_id, acao, recurso, detalhes, created_at)
       VALUES (?, 'ALERTA', ?, ?, datetime('now'))`
    ).bind(userId || "system", severidade || "warning", JSON.stringify({ tipo, mensagem })).run();

    const resend = process.env.RESEND_API_KEY;
    if (resend && severidade === "critical") {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resend}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "alertas@caa-neuro.com.br",
          to: "tdahma2@gmail.com",
          subject: `🚨 CAA Neuro CRÍTICO — ${tipo}`,
          html: `<h2>Alerta Crítico</h2><p><strong>Tipo:</strong> ${tipo}</p><p><strong>Mensagem:</strong> ${mensagem}</p><p><strong>Usuário:</strong> ${userId || "sistema"}</p><p><strong>Hora:</strong> ${new Date().toLocaleString("pt-BR")}</p>`
        })
      }).catch(() => {});
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message });
  }
}
