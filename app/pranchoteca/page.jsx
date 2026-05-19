"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const CATS = { all:"Todas", core:"Core / Comunicação", necessidades:"Necessidades Básicas", emocoes:"Emoções", saude:"Saúde", escola:"Escola / Educação", social:"Vida Social" };

export default function PranchotecaPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(null);
  const [imported, setImported] = useState(null);

  useEffect(() => {
    fetch("/api/templates").then(r=>r.json())
      .then(d => setTemplates(d.templates || []))
      .finally(() => setLoading(false));
  }, []);

  async function importar(template) {
    setImporting(template.id);
    try {
      const cards = template.cards.map(c => ({ ...c, id: crypto.randomUUID() }));
      await fetch("/api/cards", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ profile:"personalizado", level:"emergente", cards })
      });
      await fetch(`/api/templates/${template.id}/download`, { method:"POST" }).catch(()=>{});
      setImported(template.id);
      setTimeout(() => setImported(null), 3000);
    } catch {}
    setImporting(null);
  }

  const shown = templates.filter(t =>
    (cat === "all" || t.category === cat) &&
    (search === "" || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e7eb", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <Link href="/app" style={{ color:"#00885f", fontWeight:"800", textDecoration:"none", fontSize:"18px" }}>CAA Neuro</Link>
          <span style={{ color:"#d1d5db" }}>|</span>
          <span style={{ fontWeight:"700", color:"#071b2c" }}>📚 Pranchoteca</span>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <Link href="/app" style={{ border:"1px solid #e5e7eb", borderRadius:"8px", padding:"9px 16px", fontSize:"14px", textDecoration:"none", color:"#374151" }}>← Prancha</Link>
        </div>
      </div>

      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:"32px" }}>
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
                    {t.category && <span style={{ marginLeft:"8px" }}>· {CATS[t.category]||t.category}</span>}
                  </div>
                )}
                <div style={{ display:"flex", gap:"8px", marginTop:"auto", flexWrap:"wrap" }}>
                  <button onClick={()=>importar(t)} disabled={importing===t.id}
                    style={{ flex:1, padding:"10px", background: imported===t.id ? "#16a34a" : importing===t.id ? "#9ca3af" : "#00885f", color:"white", border:"none", borderRadius:"9px", fontWeight:"700", cursor: importing===t.id ? "wait" : "pointer", fontSize:"14px" }}>
                    {imported===t.id ? "✅ Importada!" : importing===t.id ? "Importando..." : "Importar prancha"}
                  </button>
                  <Link href="/app" style={{ padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:"9px", color:"#374151", textDecoration:"none", fontSize:"13px", display:"flex", alignItems:"center" }}>
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
