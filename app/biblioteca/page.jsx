"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      <div style={{ background:"#071b2c", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ color:"#4ec9a0", fontWeight:"800", fontSize:"20px" }}>CAA Neuro</span>
        <button onClick={() => router.push("/app")}
          style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.3)", color:"white", padding:"8px 16px", borderRadius:"8px", cursor:"pointer", fontSize:"13px" }}>
          ← Voltar à prancha
        </button>
      </div>

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
                    <img src={c.image} alt={c.label} style={{ width:"40px", height:"40px", objectFit:"contain" }} />
                    <span style={{ fontSize:"9px", color:"#374151", fontWeight:"600", textAlign:"center" }}>{c.label}</span>
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
