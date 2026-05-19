"use client";
import { useEffect, useState, useCallback, useRef } from "react";


const FALLBACK_CARDS = [
  {id:"sim",label:"Sim",image:"/cards/level-1/sim.png",cat:"core"},
  {id:"nao",label:"Não",image:"/cards/level-1/nao.png",cat:"core"},
  {id:"me-da",label:"Me dá",image:"/cards/level-1/me-da.png",cat:"core"},
  {id:"nao-quero",label:"Não quero",image:"/cards/level-1/nao-quero.png",cat:"core"},
  {id:"mais",label:"Mais",image:"/cards/level-1/mais.png",cat:"core"},
  {id:"acabou",label:"Acabou",image:"/cards/level-1/acabou.png",cat:"core"},
  {id:"ajuda",label:"Ajuda",image:"/cards/level-1/ajuda.png",cat:"core"},
  {id:"esperar",label:"Esperar",image:"/cards/level-1/esperar.png",cat:"acoes"},
  {id:"agua",label:"Água",image:"/cards/level-1/agua.png",cat:"necessidades"},
  {id:"comer",label:"Comer",image:"/cards/level-1/comer.png",cat:"necessidades"},
  {id:"banheiro",label:"Banheiro",image:"/cards/level-1/banheiro.png",cat:"necessidades"},
  {id:"dor",label:"Dor",image:"/cards/level-1/dor.png",cat:"saude"},
  {id:"dormir",label:"Dormir",image:"/cards/level-1/dormir.png",cat:"necessidades"},
  {id:"tomar-banho",label:"Tomar banho",image:"/cards/level-1/tomar-banho.png",cat:"acoes"},
  {id:"remedio",label:"Remédio",image:"/cards/level-1/remedio.png",cat:"saude"},
  {id:"feliz",label:"Feliz",image:"/cards/level-1/feliz.png",cat:"emocoes"},
  {id:"triste",label:"Triste",image:"/cards/level-1/triste.png",cat:"emocoes"},
  {id:"bravo",label:"Bravo",image:"/cards/level-1/bravo.png",cat:"emocoes"},
  {id:"medo",label:"Medo",image:"/cards/level-1/medo.png",cat:"emocoes"},
  {id:"cansado",label:"Cansado",image:"/cards/level-1/cansado.png",cat:"emocoes"},
  {id:"brincar",label:"Brincar",image:"/cards/level-1/brincar.png",cat:"acoes"},
  {id:"parar",label:"Parar",image:"/cards/level-1/parar.png",cat:"core"},
  {id:"sair",label:"Sair",image:"/cards/level-1/sair.png",cat:"lugares"},
  {id:"passear",label:"Passear",image:"/cards/level-1/passear.png",cat:"acoes"},
  {id:"escola",label:"Escola",image:"/cards/level-1/escola.png",cat:"lugares"},
];

export default function ModoPaciente() {
  const [cards, setCards] = useState([]);
  const [phrase, setPhrase] = useState([]);
  const [focus, setFocus] = useState(0);
  const [lang, setLang] = useState("pt-BR");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/cards?profile=infantil&level=emergente");
        const data = await res.json();
        let raw = data.cards || [];

        // Usar FALLBACK_CARDS se a API retornar vazio
        if (!raw.length) raw = FALLBACK_CARDS;

        // Para cada card: tenta imagem salva, depois local, depois ARASAAC
        const withImages = await Promise.all(raw.map(async (c) => {
          // 1. Prioriza imagem local pelo ID do card
          const localPath = `/cards/level-1/${c.id}.png`;
          const localOk = await fetch(localPath, { method: "HEAD" })
            .then(r => r.ok).catch(() => false);
          if (localOk) return { ...c, image: localPath };

          // 2. Se não existir local, usa imagem salva
          if (c.image || c.image_url) return { ...c, image: c.image || c.image_url };

          // 3. Busca no ARASAAC pelo label do card
          try {
            const q = encodeURIComponent(c.label || c.id);
            const ar = await fetch(`/api/images/search?q=${q}`);
            const ad = await ar.json();
            const first = ad.results?.[0];
            if (first?.url) return { ...c, image: first.url };
          } catch {}

          return { ...c, image: "" };
        }));

        setCards(withImages);
      } catch {
        setCards(FALLBACK_CARDS);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  async function speak(text) {
    try {
      const res = await fetch("/api/tts", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text, lang }) });
      const data = await res.json();
      if (data.audio) { const audio = new Audio(`data:audio/mp3;base64,${data.audio}`); audio.play(); return; }
      // fallback: traduz no cliente antes de falar
      const spoken = data.translatedText || text;
      const u = new SpeechSynthesisUtterance(spoken);
      const voices = speechSynthesis.getVoices();
      const v = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split("-")[0]));
      if (v) u.voice = v;
      u.lang = lang; speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  }


  function selectCard(card) {
    setPhrase(p => [...p, card.label]);
    speak(card.label);
  }

  const handleKey = useCallback((e) => {
    if (cards.length === 0) return;
    const cols = Math.floor((window.innerWidth - 48) / 156) || 3;
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); setFocus(f => Math.min(f + 1, cards.length - 1)); break;
      case "ArrowLeft":  e.preventDefault(); setFocus(f => Math.max(f - 1, 0)); break;
      case "ArrowDown":  e.preventDefault(); setFocus(f => Math.min(f + cols, cards.length - 1)); break;
      case "ArrowUp":    e.preventDefault(); setFocus(f => Math.max(f - cols, 0)); break;
      case "Enter":      e.preventDefault(); selectCard(cards[focus]); break;
      case "Backspace":  e.preventDefault(); setPhrase(p => p.slice(0, -1)); break;
      case " ":          e.preventDefault(); speak(phrase.join(" ")); break;
      default: break;
    }
  }, [cards, focus, phrase, lang]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const langs = [
    { code:"pt-BR", label:"🇧🇷" },
    { code:"pt-PT", label:"🇵🇹" },
    { code:"en-US", label:"🇺🇸" },
    { code:"es-ES", label:"🇪🇸" },
    { code:"fr-FR", label:"🇫🇷" },
    { code:"de-DE", label:"🇩🇪" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#f0fdf7", fontFamily:"system-ui", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:"#071b2c", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
        <a href="/app" style={{ color:"#4ec9a0", textDecoration:"none", fontSize:"13px", fontWeight:"700", background:"rgba(78,201,160,0.15)", border:"1px solid rgba(78,201,160,0.3)", padding:"6px 14px", borderRadius:"8px", display:"flex", alignItems:"center", gap:"6px" }}>← Prancha</a>
        <span style={{ color:"#4ec9a0", fontWeight:"800", fontSize:"20px" }}>CAA Neuro</span>
        <div style={{ display:"flex", gap:"6px" }}>
          {langs.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              style={{ width:"36px", height:"36px", borderRadius:"50%", border:"2px solid",
                background: lang===l.code ? "#00885f" : "transparent",
                borderColor: lang===l.code ? "#00885f" : "rgba(255,255,255,0.3)",
                fontSize:"18px", cursor:"pointer" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de frase */}
      <div style={{ background:"white", padding:"16px 20px", borderBottom:"2px solid #e5e7eb", minHeight:"72px" }}>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center", minHeight:"40px" }}>
          {phrase.length === 0
            ? <span style={{ color:"#9ca3af", fontSize:"16px" }}>Toque num card ou use as setas ↑↓←→ + Enter</span>
            : phrase.map((w, i) => (
              <span key={i} style={{ background:"#00885f", color:"white", padding:"8px 18px", borderRadius:"999px", fontSize:"18px", fontWeight:"700" }}>{w}</span>
            ))
          }
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"12px", flexWrap:"wrap" }}>
          <button onClick={() => speak(phrase.join(" "))}
            style={{ background:"#00885f", color:"white", border:"none", padding:"12px 28px", borderRadius:"10px", fontSize:"16px", fontWeight:"700", cursor:"pointer", minWidth:"120px" }}>
            🔊 Falar
          </button>
          <button onClick={() => setPhrase(p => p.slice(0,-1))}
            style={{ background:"#f3f4f6", color:"#374151", border:"none", padding:"12px 24px", borderRadius:"10px", fontSize:"16px", cursor:"pointer" }}>
            ← Apagar
          </button>
          <button onClick={() => setPhrase([])}
            style={{ background:"#fee2e2", color:"#dc2626", border:"none", padding:"12px 24px", borderRadius:"10px", fontSize:"16px", cursor:"pointer" }}>
            🗑 Limpar
          </button>
        </div>
      </div>

      {/* Cards */}
      <div ref={containerRef} style={{ flex:1, padding:"20px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"14px", alignContent:"start" }}>
        {loading && <p style={{ color:"#6b7280", gridColumn:"1/-1", textAlign:"center", padding:"40px" }}>Carregando cards...</p>}
        {!loading && cards.length === 0 && (
          <p style={{ color:"#6b7280", gridColumn:"1/-1", textAlign:"center", padding:"40px" }}>
            Nenhum card encontrado. Crie cards no painel do profissional.
          </p>
        )}
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => { setFocus(i); selectCard(card); }}
            style={{ background:"white", border: i===focus ? "3px solid #00885f" : "2px solid #e5e7eb",
              borderRadius:"18px", padding:"18px 12px", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"12px",
              boxShadow: i===focus ? "0 0 0 4px rgba(0,136,95,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
              transform: i===focus ? "scale(1.06)" : "scale(1)",
              transition:"all 0.15s" }}>
            <div style={{ width:"88px", height:"88px", borderRadius:"14px", overflow:"hidden", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {card.image
                ? <img src={card.image} alt={card.label} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                : <span style={{ fontSize:"36px" }}>🖼️</span>}
            </div>
            <span style={{ fontSize:"15px", fontWeight:"800", color:"#071b2c", textAlign:"center", lineHeight:"1.3" }}>{card.label}</span>
          </button>
        ))}
      </div>

      <div style={{ textAlign:"center", padding:"12px", color:"#9ca3af", fontSize:"12px", background:"white", borderTop:"1px solid #f3f4f6" }}>
        Use ←→↑↓ para navegar · Enter para selecionar · Espaço para falar · Backspace para apagar
      </div>
    </div>
  );
}
