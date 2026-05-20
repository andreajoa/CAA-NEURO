import { auth } from "@clerk/nextjs/server";
import { decryptPatient, decryptSession } from "../../lib/crypto";
import { d1Query } from "../../../lib/d1";
import { getPlanoUsuario, podeUsarIA } from "../../../lib/checkPlano";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createElement } from "react";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 24 },
  logo: { fontSize: 18, fontWeight: "bold", color: "#00885f", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 14 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#111827", marginBottom: 8, marginTop: 18 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { fontSize: 10, color: "#6b7280", width: 150 },
  value: { fontSize: 10, color: "#111827", flex: 1 },
  sessionCard: { backgroundColor: "#f9fafb", borderRadius: 4, padding: 10, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#00885f" },
  sessionDate: { fontSize: 9, color: "#6b7280", marginBottom: 3 },
  sessionText: { fontSize: 10, color: "#374151", lineHeight: 1.5 },
  sessionLabel: { fontSize: 9, fontWeight: "bold", color: "#00885f", marginTop: 3 },
  statBox: { flex: 1, backgroundColor: "#f0fdf4", borderRadius: 4, padding: 8, marginRight: 6, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "bold", color: "#00885f" },
  statLabel: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  statsRow: { flexDirection: "row", marginBottom: 16 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
  badge: { fontSize: 9, color: "#00885f", marginBottom: 2 },
});

function RelatorioPDF({ patient, sessions, profissional, plano }) {
  const totalSessoes = sessions.length;
  const totalMinutos = sessions.reduce((a, s) => a + (s.duracao_minutos || 0), 0);
  const comEvolucao = sessions.filter(s => s.evolucao_observada).length;
  const age = patient.data_nascimento
    ? Math.floor((Date.now() - new Date(patient.data_nascimento)) / (1000*60*60*24*365))
    : null;

  return createElement(Document, null,
    createElement(Page, { size: "A4", style: styles.page },
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.logo }, "CAA Neuro"),
        createElement(Text, { style: styles.subtitle }, "Sistema de Comunicação Aumentativa e Alternativa"),
        createElement(View, { style: styles.divider }),
        createElement(Text, { style: { fontSize: 15, fontWeight: "bold", color: "#111827", marginBottom: 3 } }, "Relatório Clínico"),
        createElement(Text, { style: { fontSize: 9, color: "#6b7280" } },
          `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} · Plano ${plano}`
        ),
      ),
      createElement(Text, { style: styles.sectionTitle }, "Dados do paciente"),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Nome"), createElement(Text, { style: styles.value }, patient.nome || "—")),
      age && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Idade"), createElement(Text, { style: styles.value }, `${age} anos`)),
      patient.data_nascimento && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Data de nascimento"), createElement(Text, { style: styles.value }, new Date(patient.data_nascimento).toLocaleDateString("pt-BR"))),
      patient.diagnostico && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Diagnóstico"), createElement(Text, { style: styles.value }, patient.diagnostico)),
      patient.responsavel && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Responsável"), createElement(Text, { style: styles.value }, patient.responsavel)),
      patient.escola && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Escola"), createElement(Text, { style: styles.value }, patient.escola)),
      patient.medicamentos && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Medicamentos"), createElement(Text, { style: styles.value }, patient.medicamentos)),
      patient.objetivos_terapeuticos && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Objetivos terapêuticos"), createElement(Text, { style: styles.value }, patient.objetivos_terapeuticos)),
      patient.observacoes && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Observações"), createElement(Text, { style: styles.value }, patient.observacoes)),
      createElement(View, { style: styles.divider }),
      createElement(Text, { style: styles.sectionTitle }, "Resumo do acompanhamento"),
      createElement(View, { style: styles.statsRow },
        createElement(View, { style: styles.statBox }, createElement(Text, { style: styles.statNum }, String(totalSessoes)), createElement(Text, { style: styles.statLabel }, "Sessões")),
        createElement(View, { style: styles.statBox }, createElement(Text, { style: styles.statNum }, String(totalMinutos)), createElement(Text, { style: styles.statLabel }, "Minutos totais")),
        createElement(View, { style: { ...styles.statBox, marginRight: 0 } }, createElement(Text, { style: styles.statNum }, String(comEvolucao)), createElement(Text, { style: styles.statLabel }, "Com evolução")),
      ),
      createElement(Text, { style: styles.sectionTitle }, `Histórico de sessões (${totalSessoes})`),
      ...sessions.slice(0, 25).map((s, i) =>
        createElement(View, { key: s.id || i, style: styles.sessionCard },
          createElement(Text, { style: styles.sessionDate },
            `Sessão ${totalSessoes - i} — ${new Date(s.created_at || s.data_sessao).toLocaleDateString("pt-BR")}${s.duracao_minutos ? ` · ${s.duracao_minutos} min` : ""}`
          ),
          s.evolucao_observada && createElement(Text, { style: styles.sessionText }, s.evolucao_observada),
          s.objetivos_sessao && createElement(View, null,
            createElement(Text, { style: styles.sessionLabel }, "Objetivo: "),
            createElement(Text, { style: styles.sessionText }, s.objetivos_sessao)
          ),
          s.notas && createElement(View, null,
            createElement(Text, { style: styles.sessionLabel }, "Notas: "),
            createElement(Text, { style: styles.sessionText }, s.notas)
          ),
        )
      ),
      createElement(View, { style: styles.footer },
        createElement(Text, { style: styles.footerText }, `Profissional: ${profissional}`),
        createElement(Text, { style: styles.footerText }, "CAA Neuro — caa-neuro.com.br"),
        createElement(Text, { style: styles.footerText }, new Date().toLocaleDateString("pt-BR")),
      ),
    )
  );
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const planoInfo = await getPlanoUsuario(userId);
  if (!podeUsarIA(planoInfo)) {
    return Response.json({
      error: "plano_insuficiente",
      message: "Relatório PDF disponível nos planos Pro, Clínica e Instituição.",
      plano_atual: planoInfo.plano,
      upgrade_url: "/planos",
    }, { status: 403 });
  }

  const patientId = new URL(request.url).searchParams.get("patient_id");
  if (!patientId) return new Response("patient_id obrigatório", { status: 400 });

  try {
    const [rawPatient] = await d1Query(
      "SELECT * FROM patients WHERE id=? AND user_id=?", [patientId, userId]
    ) || [];
    if (!rawPatient) return new Response("Paciente não encontrado", { status: 404 });
    const patient = decryptPatient(rawPatient);

    const rawSessions = await d1Query(
      "SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY created_at DESC",
      [patientId, userId]
    ) || [];
    const sessions = rawSessions.map(decryptSession);

    const prefs = await d1Query(
      "SELECT nome_profissional, registro_crfa, profissao FROM user_prefs WHERE user_id=?",
      [userId]
    ).catch(() => []);
    const profissional = prefs?.[0]?.nome_profissional || "Profissional CAA Neuro";

    const buffer = await renderToBuffer(
      createElement(RelatorioPDF, { patient, sessions, profissional, plano: planoInfo.plano })
    );

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-${patient.nome.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
