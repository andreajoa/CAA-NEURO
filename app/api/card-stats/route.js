import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient_id");
  const period = url.searchParams.get("period") || "30"; // dias

  try {
    const where = patientId
      ? `WHERE s.user_id=? AND s.patient_id=? AND s.created_at >= datetime('now', '-${Number(period)} days') AND s.cards_usados IS NOT NULL`
      : `WHERE s.user_id=? AND s.created_at >= datetime('now', '-${Number(period)} days') AND s.cards_usados IS NOT NULL`;

    const params = patientId ? [userId, patientId] : [userId];
    const sessions = await d1Query(
      `SELECT s.id, s.cards_usados, s.created_at, s.patient_id,
              p.name as patient_name
       FROM sessions s
       LEFT JOIN patients p ON p.id = s.patient_id
       ${where}
       ORDER BY s.created_at DESC`,
      params
    );

    // Agregar frequência de cards
    const freq = {};
    const byDay = {};
    const byPatient = {};

    for (const session of sessions) {
      let cards = [];
      try { cards = JSON.parse(session.cards_usados || "[]"); } catch {}
      if (!Array.isArray(cards)) continue;

      const day = session.created_at?.slice(0, 10) || "unknown";
      const pid = session.patient_id || "geral";
      const pname = session.patient_name || "Sem paciente";

      for (const card of cards) {
        const label = typeof card === "string" ? card : (card.label || card);
        if (!label) continue;
        freq[label] = (freq[label] || 0) + 1;
        byDay[day] = byDay[day] || {};
        byDay[day][label] = (byDay[day][label] || 0) + 1;
        byPatient[pid] = byPatient[pid] || { name: pname, cards: {} };
        byPatient[pid].cards[label] = (byPatient[pid].cards[label] || 0) + 1;
      }
    }

    // Top 20 cards mais usados
    const topCards = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([label, count]) => ({ label, count }));

    // Timeline dos últimos 14 dias
    const timeline = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, cards]) => ({
        date,
        total: Object.values(cards).reduce((s, n) => s + n, 0),
        top: Object.entries(cards).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([l,c])=>({label:l,count:c})),
      }));

    // Por paciente (se não filtrado)
    const patientBreakdown = Object.entries(byPatient).map(([id, data]) => ({
      patient_id: id,
      patient_name: data.name,
      top_cards: Object.entries(data.cards).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([l,c])=>({label:l,count:c})),
      total: Object.values(data.cards).reduce((s,n)=>s+n,0),
    })).sort((a,b)=>b.total-a.total);

    return Response.json({
      period_days: Number(period),
      total_sessions: sessions.length,
      total_card_uses: Object.values(freq).reduce((s,n)=>s+n,0),
      top_cards: topCards,
      timeline,
      by_patient: patientBreakdown,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
