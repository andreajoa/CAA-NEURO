import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// Fontes de pictogramas disponíveis
async function searchArasaac(q) {
  try {
    const res = await fetch(
      `https://api.arasaac.org/v1/pictograms/pt/search/${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).slice(0, 20).map(item => ({
      id: `arasaac-${item._id}`,
      label: item.keywords?.[0]?.keyword || q,
      url: `https://static.arasaac.org/pictograms/${item._id}/${item._id}_300.png`,
      source: "ARASAAC",
      source_color: "#2563eb",
    }));
  } catch { return []; }
}

async function searchMulberry(q) {
  try {
    // Mulberry Symbols — GitHub raw search por nome de arquivo
    const terms = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    const candidates = [
      terms,
      terms.replace(/_/g, " "),
      q.toLowerCase(),
    ];
    const results = [];
    for (const term of candidates) {
      const url = `https://raw.githubusercontent.com/mulberrysymbols/mulberry-symbols/master/symbols/${encodeURIComponent(term)}.svg`;
      const check = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (check?.ok) {
        results.push({
          id: `mulberry-${term}`,
          label: q,
          url,
          source: "Mulberry",
          source_color: "#7c3aed",
        });
        break;
      }
    }
    return results;
  } catch { return []; }
}

async function searchSclera(q) {
  try {
    // Sclera Symbols — banco europeu P&B para TEA
    const term = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    const candidates = [term, term.replace(/-/g, "_"), q.toLowerCase()];
    const results = [];
    for (const t of candidates) {
      const url = `https://www.sclera.be/pictos/png/${encodeURIComponent(t)}.png`;
      const check = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) }).catch(() => null);
      if (check?.ok) {
        results.push({
          id: `sclera-${t}`,
          label: q,
          url,
          source: "Sclera",
          source_color: "#059669",
        });
        break;
      }
    }
    return results;
  } catch { return []; }
}

async function searchSymbotalk(q) {
  try {
    // SymboTalk — 28k símbolos, ARASAAC+Sclera+Tawasol, busca nativa em PT
    const res = await fetch(
      `https://api.symbotalk.com/symbols?q=${encodeURIComponent(q)}&lang=pt&limit=12`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.symbols || data.results || []);
    return items.slice(0, 12).map(item => ({
      id: `symbotalk-${item._id || item.id}`,
      label: item.name || item.translations?.find(t=>t.tLang==="pt")?.tName || q,
      url: item.image_url || item.alt_url || "",
      source: "SymboTalk",
      source_color: "#d97706",
    })).filter(r => r.url);
  } catch { return []; }
}

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q");
  const source = new URL(request.url).searchParams.get("source") || "all";
  if (!q) return Response.json({ results: [] });

  try {
    let results = [];

    if (source === "all" || source === "arasaac") {
      const arasaac = await searchArasaac(q);
      results = [...results, ...arasaac];
    }

    if (source === "all" || source === "mulberry") {
      const mulberry = await searchMulberry(q);
      results = [...results, ...mulberry];
    }

    if (source === "all" || source === "sclera") {
      const sclera = await searchSclera(q);
      results = [...results, ...sclera];
    }

    if (source === "all" || source === "symbotalk") {
      const symbotalk = await searchSymbotalk(q);
      results = [...results, ...symbotalk];
    }

    return Response.json({
      results,
      total: results.length,
      sources: {
        arasaac: results.filter(r=>r.source==="ARASAAC").length,
        mulberry: results.filter(r=>r.source==="Mulberry").length,
        sclera: results.filter(r=>r.source==="Sclera").length,
        symbotalk: results.filter(r=>r.source==="SymboTalk").length,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message, results: [] }, { status: 500 });
  }
}
