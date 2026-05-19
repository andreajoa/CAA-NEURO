"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PranchaPublica() {
  const { token } = useParams();
  const [board, setBoard] = useState(null);
  const [phrase, setPhrase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("pt-BR");

  useEffect(() => {
    fetch(`/api/share?token=${token}`)
      .then(r => r.json())
      .then(d => { setBoard(d.board); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function speak(text) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
      }
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; speechSynthesis.speak(u);
    }
  }

  function selectCard(card) {
    setPhrase(p => [...p, card.label]);
    speak(card.label);
  }

  const langs = [
    { code: "pt-BR", label: "🇧🇷 PT-BR" },
    { code: "pt-PT", label: "🇵🇹 PT-PT" },
    { code: "en-US", label: "🇺🇸 EN" },
    { code: "es-ES", label: "🇪🇸 ES" },
    { code: "fr-FR", label: "🇫🇷 FR" },
    { code: "de-DE", label: "🇩🇪 DE" },
  ];

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui", background:"#f9fafb" }}>
      <p style={{ color:"#6b7280" }}>Carregando prancha...</p>
    </div>
  );

  if (!board) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui", background:"#f9fafb" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔗</div>
        <h2 style={{ color:"#071b2c" }}>Prancha não encontrada</h2>
        <p style={{ color:"#6b7280" }}>O link pode ter expirado ou sido removido.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui" }}>
      <div style={{ background:"#071b2c", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
        <div style={{ color:"#4ec9a0", fontWeight:"800", fontSize:"18px" }}>CAA Neuro</div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:"13px" }}>{board.title}</div>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {langs.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              style={{ padding:"4px 10px", borderRadius:"999px", border:"1px solid", fontSize:"12px", cursor:"pointer",
                background: lang === l.code ? "#00885f" : "transparent",
                color: lang === l.code ? "white" : "rgba(255,255,255,0.7)",
                borderColor: lang === l.code ? "#00885f" : "rgba(255,255,255,0.3)" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 24px", background:"white", borderBottom:"1px solid #e5e7eb" }}>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", minHeight:"40px", alignItems:"center" }}>
          {phrase.length === 0 && <span style={{ color:"#9ca3af", fontSize:"14px" }}>Toque nos cards para montar uma frase</span>}
          {phrase.map((w, i) => (
            <span key={i} style={{ background:"#00885f", color:"white", padding:"6px 14px", borderRadius:"999px", fontSize:"15px", fontWeight:"600" }}>{w}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px", marginTop:"10px" }}>
          <button onClick={() => speak(phrase.join(" "))}
            style={{ background:"#00885f", color:"white", border:"none", padding:"9px 20px", borderRadius:"8px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>
            🔊 Falar frase
          </button>
          <button onClick={() => setPhrase([])}
            style={{ background:"#f3f4f6", color:"#374151", border:"none", padding:"9px 20px", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
            Limpar
          </button>
          <button onClick={() => setPhrase(p => p.slice(0, -1))}
            style={{ background:"#f3f4f6", color:"#374151", border:"none", padding:"9px 20px", borderRadius:"8px", fontSize:"13px", cursor:"pointer" }}>
            ← Apagar
          </button>
        </div>
      </div>

      <div style={{ padding:"24px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"16px" }}>
        {board.cards.map(card => (
          <button key={card.id} onClick={() => selectCard(card)}
            style={{ background:"white", border:"2px solid #e5e7eb", borderRadius:"16px", padding:"16px 12px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
              transition:"all 0.15s", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#00885f"; e.currentTarget.style.transform="scale(1.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.transform="scale(1)"; }}>
            <div style={{ width:"80px", height:"80px", borderRadius:"12px", overflow:"hidden", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {card.image
                ? <img src={card.image} alt={card.label} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                : <span style={{ fontSize:"32px" }}>🖼️</span>}
            </div>
            <span style={{ fontSize:"14px", fontWeight:"700", color:"#071b2c", textAlign:"center", lineHeight:"1.3" }}>{card.label}</span>
          </button>
        ))}
      </div>

      <div style={{ textAlign:"center", padding:"24px", color:"#9ca3af", fontSize:"12px" }}>
        Prancha criada com CAA Neuro · <a href="https://www.adhdautism.online" style={{ color:"#00885f" }}>adhdautism.online</a>
      </div>
    </div>
  );
}
