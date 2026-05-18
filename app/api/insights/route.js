import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const patientId = new URL(request.url).searchParams.get("patient_id");
  if (!patientId) return Response.json({ error: "patient_id obrigatório" }, { status: 400 });

  try {
    const db = getDB(request);
    const patient = await db.prepare("SELECT * FROM patients WHERE id=? AND user_id=?").bind(patientId, userId).first();
    if (!patient) return Response.json({ error: "Paciente não encontrado" }, { status: 404 });

    const { results: sessions } = await db.prepare(
      "SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY created_at DESC LIMIT 20"
    ).bind(patientId, userId).all();

    if (sessions.length === 0) {
      return Response.json({ insights: null, message: "Registre pelo menos uma sessão para gerar insights." });
    }

    const resumo = sessions.map((s, i) =>
      `Sessão ${i+1} (${(s.created_at||"").split("T")[0]}): ${s.evolucao_observada||"sem registro"} ${s.objetivos_sessao ? `| Objetivo: ${s.objetivos_sessao}` : ""} ${s.duracao_minutos ? `| ${s.duracao_minutos}min` : ""}`
    ).join("\n");

    const prompt = `Você é um assistente clínico especializado em CAA (Comunicação Aumentativa e Alternativa).
Analise o histórico de sessões e gere insights clínicos objetivos.

Paciente: ${patient.nome}
Diagnóstico: ${patient.diagnostico || "Não informado"}
Objetivos terapêuticos: ${patient.objetivos_terapeuticos || "Não informado"}

Histórico (${sessions.length} sessões):
${resumo}

Responda APENAS em JSON válido, sem markdown, sem texto fora do JSON:
{
  "progresso": "frase curta sobre evolução geral",
  "pontos_fortes": ["ponto 1", "ponto 2"],
  "areas_atencao": ["área 1", "área 2"],
  "sugestoes": ["sugestão 1", "sugestão 2", "sugestão 3"],
  "tendencia": "crescente",
  "proximos_passos": "recomendação para próximas sessões",
  "total_sessoes": ${sessions.length},
  "media_duracao": ${Math.round(sessions.reduce((a,s)=>a+(s.duracao_minutos||0),0)/Math.max(sessions.length,1))}
}`;

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data.error?.message || "Erro na GLM API" }, { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const insights = JSON.parse(clean);

    return Response.json({ insights, patient_nome: patient.nome });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
