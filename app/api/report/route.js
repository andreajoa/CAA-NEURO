import { auth } from "@clerk/nextjs/server";
import { decryptPatient, decryptSession } from "../../lib/crypto";
export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient_id");
  if (!patientId) return new Response("patient_id obrigatório", { status: 400 });

  try {
    const db = getDB(request);
    const rawPatient = await db.prepare("SELECT * FROM patients WHERE id=? AND user_id=?").bind(patientId, userId).first();
    if (!rawPatient) return new Response("Paciente não encontrado", { status: 404 });
    const patient = decryptPatient(rawPatient);

    const profPrefs = await db.prepare("SELECT nome_profissional, registro_crfa, profissao, conselho_regional, telefone, assinatura_base64 FROM user_prefs WHERE user_id=?").bind(userId).first().catch(()=>null);
    const nomeProfissional = profPrefs?.nome_profissional || "";
    const registroCrfa = profPrefs?.registro_crfa || "";
    const profissao = profPrefs?.profissao || "Fonoaudiólogo(a)";
    const conselho = profPrefs?.conselho_regional ? `CRFa ${profPrefs.conselho_regional}` : "";
    const assinatura = profPrefs?.assinatura_base64 || "";

    const { results: rawSessions } = await db.prepare(
      "SELECT * FROM sessions WHERE patient_id=? AND user_id=? ORDER BY data_sessao ASC"
    ).bind(patientId, userId).all();
    const sessions = rawSessions.map(decryptSession);

    const now = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });
    const age = patient.data_nascimento
      ? Math.floor((Date.now() - new Date(patient.data_nascimento)) / (1000*60*60*24*365))
      : null;

    const sessionRows = sessions.map((s, i) => `
      <tr style="background:${i%2===0?'#f9fafb':'white'}">
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151">${s.data_sessao ? new Date(s.data_sessao).toLocaleDateString("pt-BR") : "—"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151">${s.duracao_minutos ? s.duracao_minutos+"min" : "—"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151">${s.objetivos_sessao || "—"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151">${s.evolucao_observada || "—"}</td>
      </tr>`).join("");

    const barWidth = 400;
    const barH = 120;
    const barCount = Math.min(sessions.length, 8);
    const lastSessions = sessions.slice(-barCount);
    const maxDur = Math.max(...lastSessions.map(s => s.duracao_minutos || 0), 1);
    const bars = lastSessions.map((s, i) => {
      const h = Math.max(4, Math.round(((s.duracao_minutos || 0) / maxDur) * (barH - 20)));
      const x = 10 + i * (barWidth / barCount);
      const w = (barWidth / barCount) - 8;
      const label = s.data_sessao ? new Date(s.data_sessao).toLocaleDateString("pt-BR", {day:"2-digit",month:"2-digit"}) : "";
      return `<rect x="${x}" y="${barH - h}" width="${w}" height="${h}" rx="4" fill="#00885f" opacity="0.85"/>
              <text x="${x + w/2}" y="${barH + 14}" font-size="9" fill="#6b7280" text-anchor="middle">${label}</text>
              <text x="${x + w/2}" y="${barH - h - 4}" font-size="9" fill="#374151" text-anchor="middle">${s.duracao_minutos||""}</text>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #071b2c; background: white; }
  .header { background: linear-gradient(135deg, #071b2c 0%, #0a2e1f 100%); color: white; padding: 40px 48px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header h1 { font-size: 28px; font-weight: 800; color: #4ec9a0; margin-bottom: 4px; }
  .header p { color: rgba(255,255,255,0.6); font-size: 13px; }
  .header-right { text-align: right; }
  .header-right .date { color: rgba(255,255,255,0.7); font-size: 13px; }
  .section { padding: 32px 48px; border-bottom: 1px solid #e5e7eb; }
  .section h2 { font-size: 15px; font-weight: 800; color: #00885f; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 20px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
  .field p { font-size: 14px; color: #374151; line-height: 1.5; }
  .table-wrap { overflow: hidden; border-radius: 10px; border: 1px solid #e5e7eb; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #071b2c; color: white; padding: 11px 14px; font-size: 12px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.04em; }
  .chart-box { background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; padding: 20px 24px; margin-top: 8px; }
  .chart-box h3 { font-size: 13px; color: #6b7280; margin-bottom: 12px; font-weight: 600; }
  .footer { background: #f9fafb; padding: 28px 48px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #00885f; }
  .footer p { font-size: 12px; color: #9ca3af; }
  .sig-line { border-top: 1px solid #374151; width: 200px; padding-top: 6px; font-size: 12px; color: #374151; text-align: center; }
  .badge { display: inline-block; background: #f0fdf4; color: #15803d; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid #bbf7d0; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>CAA Neuro</h1>
    <p>Plataforma de Comunicação Aumentativa e Alternativa</p>
    <div style="margin-top:12px"><span class="badge">Relatório Clínico</span></div>
  </div>
  <div class="header-right">
    <p style="font-size:18px;font-weight:800;color:white;margin-bottom:4px">${patient.nome}</p>
    ${age !== null ? `<p style="color:rgba(255,255,255,0.7);font-size:13px">${age} anos</p>` : ""}
    <p class="date">Emitido em ${now}</p>
    <p class="date">${sessions.length} sessão(ões) registrada(s)</p>
  </div>
</div>

<div class="section">
  <h2>Dados do Paciente</h2>
  <div class="grid2">
    <div class="field"><label>Nome completo</label><p>${patient.nome || "—"}</p></div>
    <div class="field"><label>Data de nascimento</label><p>${patient.data_nascimento ? new Date(patient.data_nascimento).toLocaleDateString("pt-BR") : "—"}</p></div>
    <div class="field"><label>Diagnóstico</label><p>${patient.diagnostico || "—"}</p></div>
    <div class="field"><label>Responsável</label><p>${patient.responsavel || "—"}</p></div>
    <div class="field"><label>Escola</label><p>${patient.escola || "—"}</p></div>
    <div class="field"><label>Medicamentos</label><p>${patient.medicamentos || "—"}</p></div>
    <div class="field" style="grid-column:1/-1"><label>Objetivos Terapêuticos</label><p>${patient.objetivos_terapeuticos || "—"}</p></div>
    ${patient.observacoes ? `<div class="field" style="grid-column:1/-1"><label>Observações</label><p>${patient.observacoes}</p></div>` : ""}
  </div>
</div>

${sessions.length > 1 ? `
<div class="section">
  <h2>Evolução por Sessão (duração em minutos)</h2>
  <div class="chart-box">
    <h3>Últimas ${barCount} sessões</h3>
    <svg width="${barWidth}" height="${barH + 24}" viewBox="0 0 ${barWidth} ${barH + 24}">
      ${bars}
    </svg>
  </div>
</div>` : ""}

<div class="section">
  <h2>Histórico de Sessões</h2>
  ${sessions.length === 0 ? `<p style="color:#9ca3af;font-size:14px">Nenhuma sessão registrada.</p>` : `
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th>Data</th><th>Duração</th><th>Objetivos</th><th>Evolução observada</th>
      </tr></thead>
      <tbody>${sessionRows}</tbody>
    </table>
  </div>`}
</div>

<div class="footer">
  <div>
    <p><strong>${nomeProfissional || "Profissional"}</strong> · ${profissao}</p>
    <p>${registroCrfa ? registroCrfa + " · " : ""}${conselho}</p>
    <p style="margin-top:4px;color:#9ca3af">CAA Neuro · Dados protegidos pela LGPD · Res. CFFa 777/2025</p>
  </div>
  <div style="text-align:center">
    ${assinatura
      ? `<img src="${assinatura}" style="max-height:48px;max-width:160px;object-fit:contain;margin-bottom:4px;display:block"/>`
      : `<div style="width:160px;height:48px;border-bottom:1.5px solid #374151;margin-bottom:4px"></div>`
    }
    <p style="font-size:11px;color:#6b7280">${nomeProfissional || "Assinatura do Profissional"}</p>
  </div>
</div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Report-Patient": patient.nome || "",
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
