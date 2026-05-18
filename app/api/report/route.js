import { auth } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { createElement } from "react";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { marginBottom: 32 },
  logo: { fontSize: 20, fontWeight: "bold", color: "#1e40af", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", color: "#111827", marginBottom: 10, marginTop: 20 },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { fontSize: 10, color: "#6b7280", width: 140 },
  value: { fontSize: 10, color: "#111827", flex: 1 },
  sessionCard: { backgroundColor: "#f9fafb", borderRadius: 6, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#3b82f6" },
  sessionDate: { fontSize: 9, color: "#6b7280", marginBottom: 4 },
  sessionText: { fontSize: 10, color: "#374151", lineHeight: 1.5 },
  sessionLabel: { fontSize: 9, fontWeight: "bold", color: "#1e40af", marginTop: 4 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#9ca3af" },
  statBox: { flex: 1, backgroundColor: "#eff6ff", borderRadius: 6, padding: 10, marginRight: 8, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "bold", color: "#1e40af" },
  statLabel: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  statsRow: { flexDirection: "row", marginBottom: 20 },
});

function RelatorioPDF({ patient, sessions, profissional }) {
  const totalSessoes = sessions.length;
  const totalMinutos = sessions.reduce((a, s) => a + (s.duracao_minutos || 0), 0);
  const comEvolucao = sessions.filter(s => s.evolucao_observada).length;

  return createElement(Document, null,
    createElement(Page, { size: "A4", style: styles.page },
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.logo }, "CAA Neuro"),
        createElement(Text, { style: styles.subtitle }, "Sistema de Comunicação Aumentativa e Alternativa"),
        createElement(View, { style: styles.divider }),
        createElement(Text, { style: { fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 4 } }, "Relatório Clínico"),
        createElement(Text, { style: { fontSize: 10, color: "#6b7280" } }, `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`),
      ),
      createElement(Text, { style: styles.sectionTitle }, "Dados do paciente"),
      createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Nome"), createElement(Text, { style: styles.value }, patient.nome || "—")),
      patient.data_nascimento && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Data de nascimento"), createElement(Text, { style: styles.value }, new Date(patient.data_nascimento).toLocaleDateString("pt-BR"))),
      patient.diagnostico && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Diagnóstico"), createElement(Text, { style: styles.value }, patient.diagnostico)),
      patient.responsavel && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Responsável"), createElement(Text, { style: styles.value }, patient.responsavel)),
      patient.escola && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Escola"), createElement(Text, { style: styles.value }, patient.escola)),
      patient.medicamentos && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Medicamentos"), createElement(Text, { style: styles.value }, patient.medicamentos)),
      patient.objetivos_terapeuticos && createElement(View, { style: styles.row }, createElement(Text, { style: styles.label }, "Objetivos terapêuticos"), createElement(Text, { style: styles.value }, patient.objetivos_terapeuticos)),
      createElement(View, { style: styles.divider }),
      createElement(Text, { style: styles.sectionTitle }, "Resumo do acompanhamento"),
      createElement(View, { style: styles.statsRow },
        createElement(View, { style: styles.statBox }, createElement(Text, { style: styles.statNum }, String(totalSessoes)), createElement(Text, { style: styles.statLabel }, "Sessões")),
        createElement(View, { style: styles.statBox }, createElement(Text, { style: styles.statNum }, String(totalMinutos)), createElement(Text, { style: styles.statLabel }, "Minutos")),
        createElement(View, { style: { ...styles.statBox, marginRight: 0 } }, createElement(Text, { style: styles.statNum }, String(comEvolucao)), createElement(Text, { style: styles.statLabel }, "Com evolução")),
      ),
      createElement(Text, { style: styles.sectionTitle }, `Histórico de sessões (${totalSessoes})`),
      ...sessions.slice(0, 20).map((s, i) =>
        createElement(View, { key: s.id, style: styles.sessionCard },
          createElement(Text, { style: styles.sessionDate }, `Sessão ${totalSessoes - i} — ${new Date(s.created_at).toLocaleDateString("pt-BR")}${s.duracao_minutos ? ` · ${s.duracao_minutos} min` : ""}`),
          s.evolucao_observada && createElement(Text, { style: styles.sessionText }, s.evolucao_observada),
          s.objetivos_sessao && createElement(View, null, createElement(Text, { style: styles.sessionLabel }, "Objetivo: "), createElement(Text, { style: styles.sessionText }, s.objetivos_sessao)),
          s.notas && createElement(View, null, createElement(Text, { style: styles.sessionLabel }, "Notas: "), createElement(Text, { style: styles.sessionText }, s.notas)),
        )
      ),
      createElement(View, { style: styles.footer },
        createElement(Text, { style: styles.footerText }, `Profissional: ${profissional}`),
        createElement(Text, { style: styles.footerText }, "CAA Neuro — caa-neuro.com.br"),
        createElement(Text, { style: styles.footerText }, `Página 1`),
      ),
    )
  );
}

export async function GET(request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const patientId = new URL(request.url).searchParams.get("patient_id");
  if (!patientId) return Response.json({ error: "patient_id obrigatório" }, { status: 400 });

  try {
    const db = getDB(request);
    const patient = await db.prepare("SELECT * FROM patients WHERE id=? AND user_id=?").bind(patientId, userId).first();
    if (!patient) return Response.json({ error: "Paciente não encontrado" }, { status: 404 });

    const { results: sessions } = await db.prepare(
      "SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY created_at DESC"
    ).bind(patientId, userId).all();

    const profissional = sessionClaims?.email || sessionClaims?.name || "Profissional";

    const buffer = await renderToBuffer(
      createElement(RelatorioPDF, { patient, sessions, profissional })
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
