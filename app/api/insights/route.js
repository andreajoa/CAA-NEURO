import { auth } from "@clerk/nextjs/server";
import { decryptPatient, decryptSession } from "../../lib/crypto";
import { d1Query } from "../../../lib/d1";
import { getPlanoUsuario, podeUsarIA } from "../../../lib/checkPlano";

export const runtime = "nodejs";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const planoInfo = await getPlanoUsuario(userId);
  if (!podeUsarIA(planoInfo)) {
    return Response.json({
      error: "plano_insuficiente",
      message: "Análise clínica com IA disponível nos planos Pro, Clínica e Instituição.",
      plano_atual: planoInfo.plano,
      upgrade_url: "/planos",
    }, { status: 403 });
  }

  const patientId = new URL(request.url).searchParams.get("patient_id");
  if (!patientId) return Response.json({ error: "patient_id obrigatório" }, { status: 400 });

  try {
    const [rawPatient] = await d1Query(
      "SELECT * FROM patients WHERE id=? AND user_id=?", [patientId, userId]
    ) || [];
    if (!rawPatient) return Response.json({ error: "Paciente não encontrado" }, { status: 404 });
    const patient = decryptPatient(rawPatient);

    const rawSessions = await d1Query(
      "SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY created_at DESC LIMIT 20",
      [patientId, userId]
    ) || [];
    const sessions = rawSessions.map(decryptSession);

    if (sessions.length === 0) {
      return Response.json({ insight: null, message: "Registre pelo menos uma sessão para gerar análise." });
    }

    const resumo = sessions.map((s, i) =>
      `Sessão ${i+1} (${(s.created_at||"").split("T")[0]}): ${s.evolucao_observada||"sem registro"} ${s.objetivos_sessao?`| Objetivo: ${s.objetivos_sessao}`:""} ${s.duracao_minutos?`| ${s.duracao_minutos}min`:""} ${s.notas?`| Notas: ${s.notas}`:""}`
    ).join("\n");

    const prompt = `Você é um assistente clínico especializado em CAA (Comunicação Aumentativa e Alternativa).
Analise os dados completos deste paciente e gere insights clínicos objetivos em português brasileiro.

PACIENTE:
- Nome: ${patient.nome}
- Diagnóstico: ${patient.diagnostico || "não informado"}
- Data de nascimento: ${patient.data_nascimento || "não informada"}
- Responsável: ${patient.responsavel || "não informado"}
- Escola: ${patient.escola || "não informada"}
- Medicamentos: ${patient.medicamentos || "nenhum"}
- Objetivos terapêuticos: ${patient.objetivos_terapeuticos || "não informado"}
- Observações: ${patient.observacoes || "nenhuma"}

HISTÓRICO DE SESSÕES (${sessions.length} sessões):
${resumo}

Gere uma análise clínica completa com:
1. Progresso geral observado
2. Pontos fortes do paciente
3. Áreas que precisam de atenção
4. Sugestões práticas para próximas sessões
5. Tendência de evolução (crescente, estável ou requer atenção)
6. Recomendação de próximos passos

Seja objetivo, clínico e baseado nos dados fornecidos. Use linguagem profissional adequada para fonoaudiólogos e terapeutas.`;

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (!response.ok) return Response.json({ error: data.error?.message || "Erro na IA" }, { status: 500 });

    const insight = data.choices?.[0]?.message?.content || "Não foi possível gerar análise.";

    await d1Query(
      "INSERT INTO audit_logs (user_id, acao, recurso, detalhes, created_at) VALUES (?, 'IA_INSIGHT', 'patients', ?, datetime('now'))",
      [userId, JSON.stringify({ patient_id: patientId, plano: planoInfo.plano })]
    ).catch(() => {});

    return Response.json({ insight, sessions_analyzed: sessions.length, plano: planoInfo.plano });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
