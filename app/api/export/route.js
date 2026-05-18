import { auth } from "@clerk/nextjs/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const patientId = params.get("patient_id");
  const format = params.get("format") || "xlsx";

  try {
    const db = getDB(request);
    const patient = patientId
      ? await db.prepare("SELECT * FROM patients WHERE id=? AND user_id=?").bind(patientId, userId).first()
      : null;

    const { results: sessions } = patientId
      ? await db.prepare("SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY created_at DESC").bind(patientId, userId).all()
      : await db.prepare("SELECT s.*, p.nome as paciente_nome FROM sessions s LEFT JOIN patients p ON s.patient_id=p.id WHERE s.user_id=? ORDER BY s.created_at DESC").bind(userId).all();

    const rows = sessions.map(s => ({
      "Paciente": s.paciente_nome || patient?.nome || "—",
      "Data": new Date(s.created_at).toLocaleDateString("pt-BR"),
      "Duração (min)": s.duracao_minutos || "",
      "Evolução observada": s.evolucao_observada || "",
      "Objetivos da sessão": s.objetivos_sessao || "",
      "Notas": s.notas || "",
    }));

    if (format === "csv") {
      const headers = Object.keys(rows[0] || {});
      const csv = [
        headers.join(","),
        ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g,'""')}"`).join(","))
      ].join("\n");
      return new Response("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sessoes-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 50 }, { wch: 40 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, "Sessões");

    if (patient) {
      const infoRows = [
        { Campo: "Nome", Valor: patient.nome },
        { Campo: "Diagnóstico", Valor: patient.diagnostico || "" },
        { Campo: "Responsável", Valor: patient.responsavel || "" },
        { Campo: "Escola", Valor: patient.escola || "" },
        { Campo: "Medicamentos", Valor: patient.medicamentos || "" },
        { Campo: "Objetivos terapêuticos", Valor: patient.objetivos_terapeuticos || "" },
      ];
      const ws2 = XLSX.utils.json_to_sheet(infoRows);
      XLSX.utils.book_append_sheet(wb, ws2, "Paciente");
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="relatorio-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
