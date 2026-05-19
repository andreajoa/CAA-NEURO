import { auth } from "@clerk/nextjs/server";
import { decryptPatient, decryptSession } from "../../lib/crypto";

export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const patientId = new URL(request.url).searchParams.get("patient_id");
  if (!patientId) return Response.json({ error: "patient_id obrigatório" }, { status: 400 });

  try {
    const db = getDB(request);
    const rawPatient = await db.prepare("SELECT * FROM patients WHERE id=? AND user_id=?").bind(patientId, userId).first();
    if (!rawPatient) return Response.json({ error: "Paciente não encontrado" }, { status: 404 });
    const patient = decryptPatient(rawPatient);

    const { results: rawSessions } = await db.prepare(
      "SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY created_at DESC LIMIT 20"
    ).bind(patientId, userId).all();
    const sessions = rawSessions.map(decryptSession);

    const prompt = `Você é um assistente clínico especializado em Comunicação Aumentativa e Alternativa (CAA).

Analise os dados deste paciente e gere insights clínicos objetivos em português brasileiro.

PACIENTE:
- Nome: ${patient.nome}
- Diagnóstico: ${patient.diagnostico || "não informado"}
- Objetivos terapêuticos: ${patient.objetivos_terapeuticos || "não informado"}
- Medicamentos: ${patient.medicamentos || "nenhum"}
- Escola: ${patient.escola || "não informado"}

HISTÓRICO DE SESSÕES (${sessions.length} sessões):
${sessions.slice(0, 10).map((s, i) => `
Sessão ${i+1} - ${s.data_sessao || "data não informada"}:
- Duração: ${s.duracao_minutos || "?"}min
- Objetivos: ${s.objetivos_sessao || "não registrado"}
- Evolução: ${s.evolucao_observada || "não registrada"}
- Notas: ${s.notas || "nenhuma"}
`).join("")}

Gere uma análise clínica com:
1. Resumo do progresso atual
2. Padrões observados nas sessões
3. Pontos de atenção
4. Sugestões para próximas sessões
5. Estimativa de evolução

Seja objetivo, clínico e útil para o fonoaudiólogo. Máximo 400 palavras.`;

    const response = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "glm-4-plus",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const msg = data.error?.message || "Erro na IA";
      if (msg.includes("balance") || msg.includes("recharge")) {
        return Response.json({ error: "IA temporariamente indisponível. Créditos insuficientes." }, { status: 503 });
      }
      return Response.json({ error: msg }, { status: 500 });
    }

    const insight = data.choices?.[0]?.message?.content || "Não foi possível gerar insights.";

    await db.prepare(
      `INSERT INTO audit_logs (user_id, acao, recurso, detalhes, created_at)
       VALUES (?, 'IA_INSIGHT', 'patients', ?, datetime('now'))`
    ).bind(userId, JSON.stringify({ patient_id: patientId })).run().catch(() => {});

    return Response.json({ insight, sessions_analyzed: sessions.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
