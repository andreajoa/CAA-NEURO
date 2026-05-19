"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const FALLBACK_CARDS = [
  {id:"sim",label:"Sim"},{id:"nao",label:"Não"},{id:"ajuda",label:"Ajuda"},
  {id:"mais",label:"Mais"},{id:"agua",label:"Água"},{id:"comer",label:"Comer"},
  {id:"banheiro",label:"Banheiro"},{id:"dor",label:"Dor"},{id:"feliz",label:"Feliz"},
  {id:"triste",label:"Triste"},{id:"parar",label:"Parar"},{id:"acabou",label:"Acabou"},
];

export default function VarreduraPage() {
  const [cards, setCards] = useState(FALLBACK_CARDS);
  const [focusIndex, setFocusIndex] = useState(0);
  const [phrase, setPhrase] = useState([]);
  const [intervalMs, setIntervalMs] = useState(1500);
  const [active, setActive] = useState(false);
  const [cols, setCols] = useState(4);
  const timerRef = useRef(null);
  const focusRef = useRef(0);

  useEffect(() => { focusRef.current = focusIndex; }, [focusIndex]);

  useEffect(() => {
    fetch("/api/cards").then(r=>r.json()).then(d => {
      const raw = d.cards || [];
      if (raw.length) setCards(raw.slice(0,24).map(c => ({
        id: c.id, label: c.label,
        image: c.image || c.image_url || null
      })));
    }).catch(()=>{});
  }, []);

  const speak = useCallback((text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR"; u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }, []);

  const selectCard = useCallback((card) => {
    if (!card) return;
    speak(card.label);
    setPhrase(p => [...p, card.label]);
  }, [speak]);

  useEffect(() => {
    if (!active) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setFocusIndex(i => (i + 1) % cards.length);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [active, intervalMs, cards.length]);

  useEffect(() => {
    const handler = (e) => {
      if (["Space","Enter","KeyA","NumpadEnter"].includes(e.code)) {
        e.preventDefault();
        if (active) selectCard(cards[focusRef.current]);
      }
      if (e.code === "KeyS") setActive(a => !a);
      if (e.code === "Escape") { setActive(false); setFocusIndex(0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, cards, selectCard]);

  return (
    <div style={{minHeight:"100vh",background:"#071b2c",fontFamily:"system-ui,sans-serif",color:"white",userSelect:"none"}}>
      <div style={{background:"rgba(255,255,255,0.05)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
        <div>
          <span style={{fontWeight:"800",color:"#4ec9a0",fontSize:"16px"}}>CAA Neuro</span>
          <span style={{marginLeft:"12px",fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>Modo Varredura</span>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
          <select value={intervalMs} onChange={e=>setIntervalMs(Number(e.target.value))}
            style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",padding:"6px 10px",borderRadius:"8px",fontSize:"13px"}}>
            <option value={800}>Rápido (0.8s)</option>
            <option value={1500}>Normal (1.5s)</option>
            <option value={2500}>Lento (2.5s)</option>
            <option value={4000}>Muito lento (4s)</option>
          </select>
          <select value={cols} onChange={e=>setCols(Number(e.target.value))}
            style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",padding:"6px 10px",borderRadius:"8px",fontSize:"13px"}}>
            <option value={2}>2 colunas</option>
            <option value={3}>3 colunas</option>
            <option value={4}>4 colunas</option>
          </select>
          <button onClick={()=>setActive(a=>!a)}
            style={{background:active?"#dc2626":"#00885f",color:"white",border:"none",padding:"8px 20px",borderRadius:"8px",fontWeight:"700",cursor:"pointer",fontSize:"14px"}}>
            {active ? "⏹ Parar (S)" : "▶ Iniciar (S)"}
          </button>
          <a href="/paciente" style={{color:"rgba(255,255,255,0.6)",fontSize:"13px",textDecoration:"none"}}>← Modo toque</a>
        </div>
      </div>

      <div style={{background:"rgba(255,255,255,0.08)",padding:"14px 20px",minHeight:"52px",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
        {phrase.length === 0
          ? <span style={{color:"rgba(255,255,255,0.3)",fontSize:"15px"}}>Pressione S para iniciar · Espaço ou Enter para selecionar</span>
          : phrase.map((w,i) => (
              <span key={i} style={{background:"rgba(78,201,160,0.2)",border:"1px solid rgba(78,201,160,0.4)",padding:"6px 14px",borderRadius:"8px",fontSize:"16px",fontWeight:"600"}}>{w}</span>
            ))
        }
        {phrase.length > 0 && (
          <div style={{marginLeft:"auto",display:"flex",gap:"8px"}}>
            <button onClick={()=>speak(phrase.join(" "))}
              style={{background:"#00885f",border:"none",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"700",fontSize:"13px"}}>🔊 Falar</button>
            <button onClick={()=>setPhrase(p=>p.slice(0,-1))}
              style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Desfazer</button>
            <button onClick={()=>setPhrase([])}
              style={{background:"rgba(220,38,38,0.3)",border:"none",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>Limpar</button>
          </div>
        )}
      </div>

      <div style={{padding:"20px",display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:"12px"}}>
        {cards.map((card,i) => (
          <button key={card.id} onClick={()=>selectCard(card)}
            style={{
              background: i===focusIndex&&active ? "#00885f" : "rgba(255,255,255,0.08)",
              border: i===focusIndex&&active ? "3px solid #4ec9a0" : "2px solid rgba(255,255,255,0.1)",
              borderRadius:"16px",padding:"16px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",
              transform: i===focusIndex&&active ? "scale(1.06)" : "scale(1)",
              transition:"all 0.2s",outline:"none",
              boxShadow: i===focusIndex&&active ? "0 0 0 4px rgba(78,201,160,0.4)" : "none",
            }}>
            <div style={{width:"72px",height:"72px",borderRadius:"12px",background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {card.image
                ? <img src={card.image} alt={card.label} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";}} />
                : <span style={{fontSize:"28px"}}>🖼️</span>}
            </div>
            <span style={{fontSize:"14px",fontWeight:"700",color:"white",textAlign:"center",lineHeight:"1.3"}}>{card.label}</span>
          </button>
        ))}
      </div>

      <div style={{padding:"0 20px 24px",textAlign:"center"}}>
        <p style={{color:"rgba(255,255,255,0.3)",fontSize:"12px"}}>
          S = Iniciar/Parar · Espaço / Enter / A = Selecionar · Esc = Resetar · Toque direto também funciona
        </p>
      </div>
    </div>
  );
}
