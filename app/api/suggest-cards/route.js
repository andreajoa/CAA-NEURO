import { auth } from "@clerk/nextjs/server";

const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

// Regras de co-ocorrência: se o último card foi X, sugere Y
const COOCURRENCE = {
  "Eu": ["quero","preciso","estou","tenho","gosto","não"],
  "quero": ["água","comer","brincar","ir","descansar","mais","parar"],
  "preciso": ["ajuda","ir","esperar","parar","comer","beber"],
  "Não": ["quero","gosto","entendi","consigo","sei"],
  "água": ["mais","acabou","obrigado","por favor"],
  "comer": ["mais","acabou","obrigado","não quero"],
  "sim": ["mais","obrigado","por favor"],
  "não": ["quero","gosto","entendi","consigo"],
  "ajuda": ["por favor","obrigado","esperar"],
  "mais": ["água","comer","brincar","por favor"],
  "feliz": ["brincar","obrigado","mais"],
  "triste": ["ajuda","não quero","parar"],
  "dor": ["ajuda","remédio","parar","chamar"],
  "banheiro": ["ir","preciso","ajuda","esperar"],
  "cansado": ["descansar","parar","dormir"],
  "bravo": ["parar","não","sair"],
  "medo": ["ajuda","não","parar","chamar"],
};

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const patientId = url.searchParams.get("patient_id");
  const lastCards = url.searchParams.get("last")?.split(",").filter(Boolean) || [];

  try {
    const db = getDB(request);

    // 1. Predição em tempo real baseada no último card selecionado
    const realtimeSuggestions = [];
    if (lastCards.length > 0) {
      const lastLabel = lastCards[lastCards.length - 1].toLowerCase();
      // Buscar no dicionário de co-ocorrência
      const coKey = Object.keys(COOCURRENCE).find(k => k.toLowerCase() === lastLabel);
      if (coKey) realtimeSuggestions.push(...COOCURRENCE[coKey]);

      // Buscar co-ocorrência no histórico do paciente
      if (patientId) {
        const { results: sessions } = await db.prepare(
          "SELECT cards_usados FROM sessions WHERE patient_id=? AND user_id=? AND cards_usados IS NOT NULL ORDER BY created_at DESC LIMIT 50"
        ).bind(patientId, userId).all();

        const pairFreq = {};
        for (const s of sessions) {
          try {
            const used = JSON.parse(s.cards_usados || "[]");
            for (let i = 0; i < used.length - 1; i++) {
              if (used[i].toLowerCase() === lastLabel) {
                const next = used[i + 1];
                pairFreq[next] = (pairFreq[next] || 0) + 1;
              }
            }
          } catch {}
        }
        const learnedNext = Object.entries(pairFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([label]) => label);
        // Priorizar aprendido do histórico
        realtimeSuggestions.unshift(...learnedNext);
      }
    }

    // 2. Top cards mais usados pelo paciente (sugestões gerais)
    let topCards = [];
    if (patientId) {
      const { results: sessions } = await db.prepare(
        "SELECT cards_usados FROM sessions WHERE patient_id=? AND user_id=? AND cards_usados IS NOT NULL ORDER BY created_at DESC LIMIT 30"
      ).bind(patientId, userId).all();

      const freq = {};
      for (const s of sessions) {
        try {
          const used = JSON.parse(s.cards_usados || "[]");
          for (const card of used) { freq[card] = (freq[card] || 0) + 1; }
        } catch {}
      }
      topCards = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, count]) => ({ label, count }));
    }

    // Deduplicar sugestões em tempo real
    const seen = new Set();
    const uniqueSuggestions = realtimeSuggestions
      .filter(s => { if (seen.has(s)) return false; seen.add(s); return true; })
      .slice(0, 6);

    return Response.json({
      next_suggestions: uniqueSuggestions,
      top_cards: topCards,
      total_sessoes: 0,
    });
  } catch (e) {
    return Response.json({ error: e.message, next_suggestions: [], top_cards: [] }, { status: 500 });
  }
}
