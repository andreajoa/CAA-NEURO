"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATS = { all:"Todas", core:"Core / Comunicação", necessidades:"Necessidades Básicas", emocoes:"Emoções", saude:"Saúde", escola:"Escola / Educação", social:"Vida Social" };

export default function PranchotecaPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(null);
  const [imported, setImported] = useState(null);
  const [preview, setPreview] = useState(null); // template sendo visualizado

  useEffect(() => {
    fetch("/api/templates").then(r=>r.json())
      .then(d => setTemplates(d.templates || []))
      .finally(() => setLoading(false));
  }, []);

  function normCat(v) {
    const x = String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (!x) return "";
    if (["core","comunicacao","comunicação","core / comunicacao","core / comunicação"].includes(x)) return "core";
    if (["necessidades","necessidades basicas","necessidades básicas"].includes(x)) return "necessidades";
    if (["emocoes","emoções","emocoes"].includes(x)) return "emocoes";
    if (["saude","saúde"].includes(x)) return "saude";
    if (["escola","educacao","educação","escola / educacao","escola / educação"].includes(x)) return "escola";
    if (["social","vida social"].includes(x)) return "social";
    return x;
  }

  async function importar(template) {
    setImporting(template.id);
    try {
      const cards = template.cards.map(c => ({
        ...c,
        id: crypto.randomUUID(),
        image: c.image || c.image_url || "",
        cat: c.cat || c.category || "core",
      }));

      // Detectar perfil mais adequado pela categoria da prancha
      const catMap = {
        saude: "clinico", escola: "escolar", emocoes: "infantil",
        necessidades: "adulto", core: "infantil", podd: "clinico",
      };
      const profile = catMap[template.category] || "infantil";
      const level = "emergente";

      // Salvar no banco com o perfil correto
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, level, cards }),
      });

      // Incrementar downloads
      await fetch(`/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: template.slug }),
      }).catch(() => {});

      // Redirecionar para /app com perfil e nível corretos (hard redirect garante que useState lê a URL correta)
      window.location.href = `/app?profile=${profile}&level=${level}&from=pranchoteca`;
    } catch (e) {
      console.error(e);
      setImporting(null);
    }
  }

  const shown = templates.filter(t =>
    (cat === "all" || normCat(t.category) === cat) &&
    (search === "" || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,sans-serif"}}>


      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:"32px" }}>
          <Link href="/app" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#00885f", fontWeight:"600", fontSize:"14px", textDecoration:"none", marginBottom:"16px" }}>← Voltar à prancha</Link>
          <h1 style={{ fontSize:"28px", fontWeight:"800", color:"#071b2c", margin:"0 0 8px" }}>Pranchoteca</h1>
          <p style={{ color:"#6b7280", margin:"0 0 20px" }}>Pranchas prontas criadas por especialistas. Importe com um clique e personalize para seu paciente.</p>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar prancha..."
              style={{ border:"1px solid #e5e7eb", borderRadius:"8px", padding:"9px 14px", fontSize:"14px", minWidth:"200px" }} />
            {Object.entries(CATS).map(([k,v]) => (
              <button key={k} onClick={()=>setCat(k)}
                style={{ padding:"8px 14px", borderRadius:"20px", border: cat===k ? "2px solid #00885f" : "1px solid #e5e7eb", background: cat===k ? "#f0fdf4" : "white", color: cat===k ? "#00885f" : "#374151", fontSize:"13px", fontWeight: cat===k ? "700" : "500", cursor:"pointer" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#9ca3af" }}>Carregando pranchoteca...</div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px", background:"white", borderRadius:"16px", border:"1px solid #e5e7eb" }}>
            <div style={{ fontSize:"48px", marginBottom:"16px" }}>📋</div>
            <p style={{ fontWeight:"700", color:"#374151" }}>Nenhuma prancha encontrada</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"20px" }}>
            {shown.map(t => (
              <div key={t.id} style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"24px", display:"flex", flexDirection:"column", gap:"12px" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px", marginBottom:"8px" }}>
                    <h3 style={{ fontSize:"16px", fontWeight:"800", color:"#071b2c", margin:0 }}>{t.title}</h3>
                    <span style={{ background:"#f0fdf4", color:"#16a34a", padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", flexShrink:0 }}>
                      {t.cards?.length||0} cards
                    </span>
                  </div>
                  {t.description && <p style={{ color:"#6b7280", fontSize:"13px", lineHeight:"1.6", margin:0 }}>{t.description}</p>}
                </div>
                {(t.autor || t.category) && (
                  <div style={{ fontSize:"12px", color:"#9ca3af" }}>
                    {t.autor && <span>👩‍⚕️ {t.autor}{t.autor_profissao ? ` · ${t.autor_profissao}` : ""}</span>}
                    {t.category && <span style={{ marginLeft:"8px" }}>· {CATS[normCat(t.category)] || t.category}</span>}
                  </div>
                )}
                <div style={{ display:"flex", gap:"8px", marginTop:"auto", flexWrap:"wrap" }}>
                  <button onClick={()=>importar(t)} disabled={importing===t.id}
                    style={{ flex:1, padding:"10px", background: imported===t.id ? "#16a34a" : importing===t.id ? "#9ca3af" : "#00885f", color:"white", border:"none", borderRadius:"9px", fontWeight:"700", cursor: importing===t.id ? "wait" : "pointer", fontSize:"14px" }}>
                    {imported===t.id ? "✅ Importada!" : importing===t.id ? "Importando..." : "Importar prancha"}
                  </button>
                  <button onClick={() => setPreview(t)}
                    style={{ padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"9px", color:"#374151", background:"white", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", fontWeight:"600" }}>
                    Ver →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"white", borderRadius:"20px", maxWidth:"720px", width:"100%", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding:"24px 28px", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px", position:"sticky", top:0, background:"white", borderRadius:"20px 20px 0 0", zIndex:1 }}>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#071b2c", margin:"0 0 4px" }}>{preview.title}</h2>
                <p style={{ fontSize:"13px", color:"#6b7280", margin:0 }}>
                  {preview.cards?.length} cards
                  {preview.autor && " · " + preview.autor}
                  {preview.autor_profissao && " · " + preview.autor_profissao}
                </p>
                {preview.description && <p style={{ fontSize:"13px", color:"#374151", margin:"8px 0 0", lineHeight:"1.6" }}>{preview.description}</p>}
              </div>
              <button onClick={() => setPreview(null)}
                style={{ background:"#f3f4f6", border:"none", width:"36px", height:"36px", borderRadius:"50%", fontSize:"20px", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                x
              </button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(96px, 1fr))", gap:"10px", marginBottom:"24px" }}>
                {(preview.cards || []).map((c, i) => (
                  <div key={i} style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"10px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", textAlign:"center" }}>
                    <ModalCardImg card={c} />
                    <span style={{ fontSize:"11px", fontWeight:"700", color:"#071b2c", lineHeight:"1.3", wordBreak:"break-word" }}>{c.label}</span>
                    {c.cat && <span style={{ fontSize:"9px", color:"#9ca3af", textTransform:"uppercase" }}>{c.cat}</span>}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:"12px" }}>
                <button onClick={() => { importar(preview); setPreview(null); }} disabled={!!importing}
                  style={{ flex:2, padding:"13px", background:"#00885f", color:"white", border:"none", borderRadius:"10px", fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>
                  Importar esta prancha
                </button>
                <button onClick={() => setPreview(null)}
                  style={{ flex:1, padding:"13px", border:"1px solid #e5e7eb", background:"white", borderRadius:"10px", fontSize:"14px", cursor:"pointer", color:"#374151" }}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalCardImg({ card }) {
  const [src, setSrc] = useState(
    card.image || (!card.id?.startsWith("podd") && !card.id?.startsWith("transito") ? "/cards/level-1/" + card.id + ".webp?v=20260521-optimized" : null)
  );
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!src && !tried) {
      setTried(true);
      fetch("/api/images/search?q=" + encodeURIComponent(card.label || card.id))
        .then(r => r.json())
        .then(d => { const url = d.results?.[0]?.url; if (url) setSrc(url); })
        .catch(() => {});
    }
  }, [card, src, tried]);

  if (!src) return (
    <div style={{ width:"52px", height:"52px", background:"#e5e7eb", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>?</div>
  );
  return <img src={src} alt={card.label} style={{ width:"52px", height:"52px", objectFit:"contain" }} onError={() => setSrc(null)} />;
}
