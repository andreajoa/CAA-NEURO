import { auth } from "@clerk/nextjs/server";
import ExcelJS from "exceljs";
import { getDatabase } from "../../../lib/d1";
import { decrypt, decryptPatient, decryptSession } from "../../lib/crypto";
import { getAccessiblePatient } from "../../../lib/patientAccess";

export const runtime = "nodejs";

function csvSafe(value) {
  const stringValue = String(value ?? "");
  return /^[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const patientId = params.get("patient_id");
  const format = params.get("format") || "xlsx";

  try {
    const db = getDatabase(request);
    const rawPatient = patientId
      ? await getAccessiblePatient(patientId, userId)
      : null;
    if (patientId && !rawPatient) return Response.json({ error: "Paciente não encontrado" }, { status: 404 });
    const patient = rawPatient ? decryptPatient(rawPatient) : null;

    const { results: rawSessions } = patientId
      ? await db.prepare("SELECT * FROM sessions WHERE patient_id=? ORDER BY created_at DESC").bind(patientId).all()
      : await db.prepare("SELECT s.*, p.nome as paciente_nome FROM sessions s LEFT JOIN patients p ON s.patient_id=p.id WHERE s.user_id=? ORDER BY s.created_at DESC").bind(userId).all();
    const sessions = rawSessions.map(session => ({
      ...decryptSession(session),
      paciente_nome: decrypt(session.paciente_nome),
    }));

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
        ...rows.map(r => headers.map(h => `"${csvSafe(r[h]).replace(/"/g,'""')}"`).join(","))
      ].join("\n");
      return new Response("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sessoes-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CAA Neuro";
    workbook.created = new Date();
    const sessionsSheet = workbook.addWorksheet("Sessões");
    sessionsSheet.columns = Object.keys(rows[0] || {
      "Paciente": "", "Data": "", "Duração (min)": "", "Evolução observada": "", "Objetivos da sessão": "", "Notas": "",
    }).map((header, index) => ({ header, key: header, width: [25, 12, 14, 50, 40, 30][index] || 20 }));
    sessionsSheet.addRows(rows);
    sessionsSheet.getRow(1).font = { bold: true };
    sessionsSheet.views = [{ state: "frozen", ySplit: 1 }];

    if (patient) {
      const infoRows = [
        { Campo: "Nome", Valor: patient.nome },
        { Campo: "Diagnóstico", Valor: patient.diagnostico || "" },
        { Campo: "Responsável", Valor: patient.responsavel || "" },
        { Campo: "Escola", Valor: patient.escola || "" },
        { Campo: "Medicamentos", Valor: patient.medicamentos || "" },
        { Campo: "Objetivos terapêuticos", Valor: patient.objetivos_terapeuticos || "" },
      ];
      const patientSheet = workbook.addWorksheet("Paciente");
      patientSheet.columns = [
        { header: "Campo", key: "Campo", width: 28 },
        { header: "Valor", key: "Valor", width: 60 },
      ];
      patientSheet.addRows(infoRows);
      patientSheet.getRow(1).font = { bold: true };
    }

    const buf = await workbook.xlsx.writeBuffer();
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
