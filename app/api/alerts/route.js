import { auth } from "@clerk/nextjs/server";
import { getDatabase } from "../../../lib/d1";
export const runtime = "nodejs";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { tipo, mensagem, severidade } = await request.json();
    if (!tipo?.trim() || !mensagem?.trim()) {
      return Response.json({ error: "Tipo e mensagem são obrigatórios" }, { status: 400 });
    }
    const db = getDatabase(request);
    await db.prepare(
      `INSERT INTO audit_logs (user_id, acao, recurso, detalhes, created_at)
       VALUES (?, 'ALERTA', ?, ?, datetime('now'))`
    ).bind(userId, severidade || "warning", JSON.stringify({ tipo: tipo.slice(0, 120), mensagem: mensagem.slice(0, 2000) })).run();

    const resend = process.env.RESEND_API_KEY;
    if (resend && severidade === "critical") {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resend}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "alertas@caa-neuro.com.br",
          to: "tdahma2@gmail.com",
          subject: `🚨 CAA Neuro CRÍTICO — ${tipo}`,
          text: `Tipo: ${tipo.slice(0, 120)}\nMensagem: ${mensagem.slice(0, 2000)}\nUsuário: ${userId}\nHora: ${new Date().toISOString()}`
        })
      }).catch(() => {});
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message });
  }
}
