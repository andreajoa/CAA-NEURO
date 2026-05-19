import { auth } from "@clerk/nextjs/server";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const patientId = new URL(request.url).searchParams.get("patient_id");
  if (!patientId) return Response.json({ suggestions: [] });

  try {
    const db = getDB(request);
    const { results: sessions } = await db.prepare(
      "SELECT cards_usados FROM sessions WHERE patient_id=? AND user_id=? AND cards_usados IS NOT NULL ORDER BY created_at DESC LIMIT 30"
    ).bind(patientId, userId).all();

    // Contar frequência de cada card
    const freq = {};
    for (const s of sessions) {
      try {
        const cards = JSON.parse(s.cards_usados || "[]");
        for (const card of cards) {
          freq[card] = (freq[card] || 0) + 1;
        }
      } catch {}
    }

    // Top cards mais usados
    const topCards = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));

    // Sugestões baseadas nos top cards
    const suggestions = [];
    if (topCards.length >= 3) {
      const topLabels = topCards.slice(0, 3).map(c => c.label);
      suggestions.push({
        tipo: "categoria",
        mensagem: `O paciente usa muito: "${topLabels.join('", "')}". Considere criar uma categoria específica para esses cards.`,
        cards: topLabels,
      });
    }
    if (topCards.length > 0) {
      suggestions.push({
        tipo: "mais_usados",
        mensagem: `Cards mais utilizados nas últimas sessões:`,
        cards: topCards.map(c => `${c.label} (${c.count}x)`),
      });
    }
    if (sessions.length >= 5 && topCards.length === 0) {
      suggestions.push({
        tipo: "sem_registro",
        mensagem: "Sessões registradas mas sem cards_usados. Registre os cards utilizados em cada sessão para receber sugestões.",
        cards: [],
      });
    }

    return Response.json({ suggestions, top_cards: topCards, total_sessoes: sessions.length });
  } catch (e) {
    return Response.json({ error: e.message, suggestions: [] }, { status: 500 });
  }
}
