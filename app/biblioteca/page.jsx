"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


function CardPreviewImg({ card }) {
  const [src, setSrc] = useState(
    card.image ||
    (card.id && !card.id.startsWith("podd") ? `/cards/level-1/${card.id}.png` : null)
  );
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!src && !tried) {
      setTried(true);
      const q = encodeURIComponent(card.label || card.id);
      fetch(`/api/images/search?q=${q}`)
        .then(r => r.json())
        .then(d => {
          const url = d.results?.[0]?.url;
          if (url) setSrc(url);
        })
        .catch(() => {});
    }
  }, [card, src, tried]);

  if (!src) return (
    <div style={{ width:"40px", height:"40px", background:"#f3f4f6", borderRadius:"6px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>
      🖼️
    </div>
  );

  return (
    <img
      src={src}
      alt={card.label}
      style={{ width:"40px", height:"40px", objectFit:"contain" }}
      onError={() => setSrc(null)}
    />
  );
}

export default function Biblioteca() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(null);
  const [done, setDone] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/templates")
      .then(r => r.json())
      .then(d => { setTemplates(d.templates || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function importar(t) {
    setImporting(t.slug);
    try {
      const existing = await fetch("/api/cards").then(r => r.json());
      const currentCards = existing.cards || [];
      const newCards = t.cards.map(c => ({ ...c, id: crypto.randomUUID() }));
      const merged = [...currentCards, ...newCards];
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: merged })
      });
      setDone(t.slug);
      setTimeout(() => router.push("/app"), 1200);
    } catch { alert("Erro ao importar."); }
    setImporting(null);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui" }}>
      <nav style={{background:"#071b2c",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #00885f"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
        <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
        <a href="/biblioteca" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📚 Biblioteca</a>
        <a href="/paciente" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👤 Modo Paciente</a>
        <a href="/atividades" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🎮 Atividades</a>
        <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(78,201,160,0.2)",border:"1px solid #4ec9a0",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>✨ Relatório IA</a>
        <a href="/admin" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📊 Admin</a>
        <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px",marginLeft:"auto"}}>❓ Ajuda</a>
      </nav>

      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:"800", color:"#071b2c", marginBottom:"8px" }}>📚 Biblioteca de Pranchas</h1>
        <p style={{ color:"#6b7280", marginBottom:"32px" }}>Importe pranchas prontas com pictogramas ARASAAC — os cards são adicionados à sua prancha atual.</p>

        {loading && <p style={{ color:"#6b7280", textAlign:"center", padding:"40px" }}>Carregando...</p>}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"20px" }}>
          {templates.map(t => (
            <div key={t.slug} style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              {/* Preview dos primeiros 4 cards */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px", background:"#f3f4f6", padding:"12px", height:"120px" }}>
                {t.cards.slice(0,4).map((c,i) => (
                  <div key={i} style={{ background:"white", borderRadius:"8px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", padding:"4px" }}>
                    <CardPreviewImg card={c} />
                    <span style={{ fontSize:"9px", color:"#374151", fontWeight:"600", textAlign:"center", lineHeight:"1.2" }}>{c.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding:"16px" }}>
                <div style={{ fontSize:"18px", fontWeight:"800", color:"#071b2c", marginBottom:"4px" }}>{t.title}</div>
                <div style={{ fontSize:"13px", color:"#6b7280", marginBottom:"16px" }}>{t.description}</div>
                <button onClick={() => importar(t)} disabled={!!importing}
                  style={{ width:"100%", padding:"10px", borderRadius:"10px", border:"none", cursor: importing ? "not-allowed" : "pointer",
                    background: done===t.slug ? "#00885f" : importing===t.slug ? "#e5e7eb" : "#00885f",
                    color: importing===t.slug && done!==t.slug ? "#6b7280" : "white",
                    fontWeight:"700", fontSize:"14px", transition:"all 0.2s" }}>
                  {done===t.slug ? "✅ Importado!" : importing===t.slug ? "Importando..." : "⬇️ Importar prancha"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
