"use client";
import React from "react";
import AppShell from "../components/AppShell";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


// ═══════════════════════════════════════════════════════════════════════════
// MAPA GLOBAL ÚNICO — usado por TODAS as atividades
// Corrigir aqui corrige em tudo. API nunca sobrescreve isso.
// ═══════════════════════════════════════════════════════════════════════════
const CARDS_FIXOS = {
  "sim":       { label:"Sim",          image:"/cards/level-1/sim.webp?v=20260521-optimized" },
  "nao":       { label:"Não",          image:"/cards/level-1/nao.webp?v=20260521-optimized" },
  "ajuda":     { label:"Ajuda",        image:"/cards/level-1/ajuda.webp?v=20260521-optimized" },
  "mais":      { label:"Mais",         image:"/cards/level-1/mais.webp?v=20260521-optimized" },
  "agua":      { label:"Água",         image:"/cards/level-1/agua.webp?v=20260521-optimized" },
  "comer":     { label:"Comer",        image:"/cards/level-1/comer.webp?v=20260521-optimized" },
  "banheiro":  { label:"Banheiro",     image:"/cards/level-1/banheiro.webp?v=20260521-optimized" },
  "dormir":    { label:"Dormir",       image:"/cards/level-1/dormir.webp?v=20260521-optimized" },
  "feliz":     { label:"Feliz",        image:"/cards/level-1/feliz.webp?v=20260521-optimized" },
  "triste":    { label:"Triste",       image:"/cards/level-1/triste.webp?v=20260521-optimized" },
  "medo":      { label:"Medo",         image:"/cards/level-1/medo.webp?v=20260521-optimized" },
  "bravo":     { label:"Bravo",        image:"/cards/level-1/bravo.webp?v=20260521-optimized" },
  "brincar":   { label:"Brincar",      image:"/cards/level-1/brincar.webp?v=20260521-optimized" },
  "parar":     { label:"Parar",        image:"/cards/level-1/parar.webp?v=20260521-optimized" },
  "esperar":   { label:"Esperar",      image:"/cards/level-1/esperar.webp?v=20260521-optimized" },
  "dor":       { label:"Dor",          image:"/cards/level-1/dor.webp?v=20260521-optimized" },
  "remedio":   { label:"Remédio",      image:"/cards/level-1/remedio.webp?v=20260521-optimized" },
  "escola":    { label:"Escola",       image:"/cards/level-1/escola.webp?v=20260521-optimized" },
  "tomar-banho":{ label:"Tomar banho", image:"/cards/level-1/tomar-banho.webp?v=20260521-optimized" },
  "sair":      { label:"Sair",         image:"/cards/level-1/sair.webp?v=20260521-optimized" },
  "passear":   { label:"Passear",      image:"/cards/level-1/passear.webp?v=20260521-optimized" },
  "cansado":   { label:"Cansado",      image:"/cards/level-1/cansado.webp?v=20260521-optimized" },
  "acabou":    { label:"Acabou",       image:"/cards/level-1/acabou.webp?v=20260521-optimized" },
  "me-da":     { label:"Me dá",        image:"/cards/level-1/me-da.webp?v=20260521-optimized" },
  "nao-quero": { label:"Não quero",    image:"/cards/level-1/nao-quero.webp?v=20260521-optimized" },
};
// Helper: dado um id, retorna { id, label, image } sempre correto
function cardFixo(id) {
  const f = CARDS_FIXOS[id];
  if (!f) return { id, label: id, image: `/cards/level-1/${id}.webp?v=20260521-optimized` };
  return { id, label: f.label, image: f.image };
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Atividades() {
  const [cards, setCards] = useState([]);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const FALLBACK = [
    {id:"sim",label:"Sim",image:"/cards/level-1/sim.webp?v=20260521-optimized",cat:"core"},
    {id:"nao",label:"Não",image:"/cards/level-1/nao.webp?v=20260521-optimized",cat:"core"},
    {id:"ajuda",label:"Ajuda",image:"/cards/level-1/ajuda.webp?v=20260521-optimized",cat:"core"},
    {id:"mais",label:"Mais",image:"/cards/level-1/mais.webp?v=20260521-optimized",cat:"core"},
    {id:"agua",label:"Água",image:"/cards/level-1/agua.webp?v=20260521-optimized",cat:"necessidades"},
    {id:"comer",label:"Comer",image:"/cards/level-1/comer.webp?v=20260521-optimized",cat:"necessidades"},
    {id:"banheiro",label:"Banheiro",image:"/cards/level-1/banheiro.webp?v=20260521-optimized",cat:"necessidades"},
    {id:"dormir",label:"Dormir",image:"/cards/level-1/dormir.webp?v=20260521-optimized",cat:"necessidades"},
    {id:"feliz",label:"Feliz",image:"/cards/level-1/feliz.webp?v=20260521-optimized",cat:"emocoes"},
    {id:"triste",label:"Triste",image:"/cards/level-1/triste.webp?v=20260521-optimized",cat:"emocoes"},
    {id:"medo",label:"Medo",image:"/cards/level-1/medo.webp?v=20260521-optimized",cat:"emocoes"},
    {id:"bravo",label:"Bravo",image:"/cards/level-1/bravo.webp?v=20260521-optimized",cat:"emocoes"},
    {id:"brincar",label:"Brincar",image:"/cards/level-1/brincar.webp?v=20260521-optimized",cat:"acoes"},
    {id:"parar",label:"Parar",image:"/cards/level-1/parar.webp?v=20260521-optimized",cat:"acoes"},
    {id:"esperar",label:"Esperar",image:"/cards/level-1/esperar.webp?v=20260521-optimized",cat:"acoes"},
    {id:"dor",label:"Dor",image:"/cards/level-1/dor.webp?v=20260521-optimized",cat:"saude"},
    {id:"remedio",label:"Remédio",image:"/cards/level-1/remedio.webp?v=20260521-optimized",cat:"saude"},
    {id:"escola",label:"Escola",image:"/cards/level-1/escola.webp?v=20260521-optimized",cat:"lugares"},
  ];

  // Mapa fixo de imagens confiáveis para os 18 ids do FALLBACK
  // Ignora completamente o campo image da API — evita imagem errada no card
  const IMAGEM_FIXA = {
    "sim":"/cards/level-1/sim.webp?v=20260521-optimized",
    "nao":"/cards/level-1/nao.webp?v=20260521-optimized",
    "ajuda":"/cards/level-1/ajuda.webp?v=20260521-optimized",
    "mais":"/cards/level-1/mais.webp?v=20260521-optimized",
    "agua":"/cards/level-1/agua.webp?v=20260521-optimized",
    "comer":"/cards/level-1/comer.webp?v=20260521-optimized",
    "banheiro":"/cards/level-1/banheiro.webp?v=20260521-optimized",
    "dormir":"/cards/level-1/dormir.webp?v=20260521-optimized",
    "feliz":"/cards/level-1/feliz.webp?v=20260521-optimized",
    "triste":"/cards/level-1/triste.webp?v=20260521-optimized",
    "medo":"/cards/level-1/medo.webp?v=20260521-optimized",
    "bravo":"/cards/level-1/bravo.webp?v=20260521-optimized",
    "brincar":"/cards/level-1/brincar.webp?v=20260521-optimized",
    "parar":"/cards/level-1/parar.webp?v=20260521-optimized",
    "esperar":"/cards/level-1/esperar.webp?v=20260521-optimized",
    "dor":"/cards/level-1/dor.webp?v=20260521-optimized",
    "remedio":"/cards/level-1/remedio.webp?v=20260521-optimized",
    "escola":"/cards/level-1/escola.webp?v=20260521-optimized",
  };

  // ── PRELOAD: carrega todas as imagens na memória do browser logo na abertura
  useEffect(() => {
    const urls = Object.values(CARDS_FIXOS).map(c => c.image);
    // Usa link rel=preload para prioridade alta no browser
    urls.forEach(url => {
      const link = document.createElement("link");
      link.rel  = "preload";
      link.as   = "image";
      link.href = url;
      document.head.appendChild(link);
    });
    // Fallback: Image() garante download mesmo sem suporte a link preload
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    fetch("/api/cards?profile=infantil&level=emergente")
      .then(r => r.json())
      .then(d => {
        const raw = (d.cards || []).filter(c => c.image || c.image_url || c.label);
        const mapped = raw.map(c => {
          const id = String(c.id || "").trim().normalize("NFC");
          // Se o id é conhecido, usa sempre a imagem confiável do mapa fixo
          // Nunca confia no campo image da API para ids conhecidos
          const image = IMAGEM_FIXA[id]
            || c.image
            || c.image_url
            || `/cards/level-1/${id}.webp?v=20260521-optimized`;
          return {
            ...c,
            id,
            label: String(c.label || "").trim(),
            image,
            cat: c.cat || c.category || "core",
          };
        });
        setCards(mapped.length >= 4 ? mapped : FALLBACK);
        setLoading(false);
      })
      .catch(() => { setCards(FALLBACK); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}>
      <p style={{color:"#6b7280"}}>Carregando atividades...</p>
    </div>
  );

  if (cards.length < 4) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",flexDirection:"column",gap:"16px",padding:"24px",textAlign:"center"}}>
      <div style={{fontSize:"48px"}}>📚</div>
      <h2 style={{color:"#1B2D5B"}}>Adicione pelo menos 4 cards na prancha para usar as atividades.</h2>
      <Link href="/app" style={{background:"#C76B4A",color:"white",padding:"12px 24px",borderRadius:"10px",textDecoration:"none",fontWeight:"700"}}>← Ir para a Prancha</Link>
    </div>
  );

  if (!mode) return <Menu setMode={setMode} router={router} total={cards.length} />;
  if (mode === "associacao") return <Associacao cards={cards} onBack={() => setMode(null)} />;
  if (mode === "pareamento") return <Pareamento cards={cards} onBack={() => setMode(null)} />;
  if (mode === "sequencia") return <Sequencia cards={cards} onBack={() => setMode(null)} />;
  if (mode === "completar") return <CompletarFrase cards={cards} onBack={() => setMode(null)} />;
  if (mode === "categorizar") return <Categorizar cards={cards} onBack={() => setMode(null)} />;
}

function Menu({ setMode, router, total }) {
  const modos = [
    { id:"associacao", emoji:"🔗", title:"Associação", desc:"Conecte a palavra à imagem correta", cor:"#2563eb" },
    { id:"pareamento", emoji:"🃏", title:"Pareamento", desc:"Encontre os pares iguais (memória)", cor:"#7c3aed" },
    { id:"sequencia",  emoji:"📖", title:"Sequência",  desc:"Ordene os cards para contar uma história", cor:"#059669" },
    { id:"completar",  emoji:"💬", title:"Completar Frase", desc:"Escolha o card que completa a frase", cor:"#d97706" },
    { id:"categorizar",emoji:"🗂️", title:"Categorização", desc:"Separe os cards por categoria", cor:"#dc2626" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui,sans-serif"}}>
      <nav style={{background:"#1B2D5B",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #C76B4A"}}>
        <span style={{color:"#E8B4A8",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
        <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
        <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👥 Pacientes</a>
        <a href="/biblioteca" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📚 Biblioteca</a>
        <a href="/atividades" style={{color:"white",textDecoration:"none",background:"rgba(78,201,160,0.3)",border:"1px solid #E8B4A8",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🎯 Atividades</a>
        <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px",marginLeft:"auto"}}>❓ Ajuda</a>
      </nav>
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"40px 24px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <h1 style={{fontSize:"28px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 8px"}}>🎯 Atividades Terapêuticas</h1>
          <p style={{color:"#6b7280",fontSize:"16px"}}>{total} cards disponíveis · Escolha uma atividade para começar</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
          {modos.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"16px",padding:"24px",textAlign:"left",cursor:"pointer",transition:"all 0.2s",display:"flex",gap:"16px",alignItems:"flex-start"}}>
              <div style={{fontSize:"36px",lineHeight:1}}>{m.emoji}</div>
              <div>
                <div style={{fontWeight:"800",fontSize:"16px",color:"#1B2D5B",marginBottom:"4px"}}>{m.title}</div>
                <div style={{fontSize:"13px",color:"#6b7280",lineHeight:"1.5"}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameHeader({ title, score, total, onBack, onRestart }) {
  return (
    <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
      <div style={{fontWeight:"700",fontSize:"16px"}}>{title}</div>
      <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
        <span style={{background:"rgba(78,201,160,0.2)",border:"1px solid rgba(78,201,160,0.4)",padding:"6px 14px",borderRadius:"20px",fontSize:"14px",fontWeight:"700"}}>
          ✅ {score}/{total}
        </span>
        <button onClick={onRestart} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>🔄</button>
      </div>
    </div>
  );
}

function Congratulations({ score, total, onRestart, onBack }) {
  const pct = Math.round((score/total)*100);
  return (
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:"64px",marginBottom:"16px"}}>{pct===100?"🏆":pct>=70?"⭐":"💪"}</div>
      <h2 style={{fontSize:"28px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 8px"}}>
        {pct===100?"Perfeito!":pct>=70?"Muito bem!":"Continue praticando!"}
      </h2>
      <p style={{color:"#6b7280",fontSize:"16px",margin:"0 0 32px"}}>{score} de {total} corretos · {pct}%</p>
      <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
        <button onClick={onRestart} style={{background:"#C76B4A",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontWeight:"700",cursor:"pointer",fontSize:"15px"}}>🔄 Tentar novamente</button>
        <button onClick={onBack} style={{background:"white",color:"#374151",border:"1px solid #e5e7eb",padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontSize:"15px"}}>← Outras atividades</button>
      </div>
    </div>
  );
}

function Associacao({ cards, onBack }) {

  // ── DADOS 100% FIXOS — API nunca interfere ─────────────────────────────
  const FALLBACK = [
    { id:"sim",      label:"Sim",        image:"/cards/level-1/sim.webp?v=20260521-optimized" },
    { id:"nao",      label:"Não",        image:"/cards/level-1/nao.webp?v=20260521-optimized" },
    { id:"ajuda",    label:"Ajuda",      image:"/cards/level-1/ajuda.webp?v=20260521-optimized" },
    { id:"mais",     label:"Mais",       image:"/cards/level-1/mais.webp?v=20260521-optimized" },
    { id:"agua",     label:"Água",       image:"/cards/level-1/agua.webp?v=20260521-optimized" },
    { id:"comer",    label:"Comer",      image:"/cards/level-1/comer.webp?v=20260521-optimized" },
    { id:"banheiro", label:"Banheiro",   image:"/cards/level-1/banheiro.webp?v=20260521-optimized" },
    { id:"dormir",   label:"Dormir",     image:"/cards/level-1/dormir.webp?v=20260521-optimized" },
    { id:"feliz",    label:"Feliz",      image:"/cards/level-1/feliz.webp?v=20260521-optimized" },
    { id:"triste",   label:"Triste",     image:"/cards/level-1/triste.webp?v=20260521-optimized" },
    { id:"medo",     label:"Medo",       image:"/cards/level-1/medo.webp?v=20260521-optimized" },
    { id:"bravo",    label:"Bravo",      image:"/cards/level-1/bravo.webp?v=20260521-optimized" },
    { id:"brincar",  label:"Brincar",    image:"/cards/level-1/brincar.webp?v=20260521-optimized" },
    { id:"parar",    label:"Parar",      image:"/cards/level-1/parar.webp?v=20260521-optimized" },
    { id:"esperar",  label:"Esperar",    image:"/cards/level-1/esperar.webp?v=20260521-optimized" },
    { id:"dor",      label:"Dor",        image:"/cards/level-1/dor.webp?v=20260521-optimized" },
    { id:"remedio",  label:"Remédio",    image:"/cards/level-1/remedio.webp?v=20260521-optimized" },
    { id:"escola",   label:"Escola",     image:"/cards/level-1/escola.webp?v=20260521-optimized" },
  ];

  // Pool fixo escolhido UMA vez — embaralha o FALLBACK e pega 6
  // Não depende de cards/API — match garantido porque ids nunca mudam
  const pool = React.useMemo(() => shuffle([...FALLBACK]).slice(0, 6), []);

  const [items,       setItems]       = useState([]);
  const [words,       setWords]       = useState([]);
  const [matched,     setMatched]     = useState(new Set());
  const [selectedImg, setSelectedImg] = useState(null);
  const [wrongWord,   setWrongWord]   = useState(null);
  const [score,       setScore]       = useState(0);
  const [done,        setDone]        = useState(false);

  function init() {
    // items = pool em ordem fixa
    // words = mesmos 6 ids/labels, embaralhados separadamente
    const frozenItems = [...pool];
    const frozenWords = shuffle(frozenItems.map(c => ({ id: c.id, label: c.label })));
    setItems(frozenItems);
    setWords(frozenWords);
    setMatched(new Set());
    setSelectedImg(null);
    setWrongWord(null);
    setScore(0);
    setDone(false);
  }

  useEffect(() => { init(); }, []);

  function handleImageClick(id) {
    if (matched.has(id)) return;
    setSelectedImg(prev => prev === id ? null : id);
    setWrongWord(null);
  }

  function handleWordClick(wordId) {
    if (!selectedImg) return;
    if (matched.has(selectedImg) || matched.has(wordId)) return;

    if (selectedImg === wordId) {
      // ✅ match correto
      const next = new Set(matched);
      next.add(selectedImg);
      setMatched(next);
      setScore(s => s + 1);
      setSelectedImg(null);
      setWrongWord(null);
      if (next.size === items.length) setTimeout(() => setDone(true), 400);
    } else {
      // ❌ errou — pisca vermelho, deseleciona imagem após 700ms
      setWrongWord(wordId);
      setTimeout(() => {
        setWrongWord(null);
        setSelectedImg(null);
      }, 700);
    }
  }

  const selectedLabel = selectedImg
    ? (items.find(c => c.id === selectedImg)?.label ?? "")
    : "";

  if (done) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🔗 Associação" score={score} total={items.length} onBack={onBack} onRestart={init} />
      <Congratulations score={score} total={items.length} onRestart={init} onBack={onBack} />
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui",paddingBottom:"40px"}}>
      <GameHeader title="🔗 Associação" score={score} total={items.length} onBack={onBack} onRestart={init} />

      {/* Instrução */}
      <p style={{
        textAlign:"center", margin:"14px 0 10px",
        fontSize:"15px", fontWeight: selectedImg ? "700" : "500",
        color: selectedImg ? "#C76B4A" : "#9ca3af",
        transition:"color 0.2s", padding:"0 16px"
      }}>
        {selectedImg
          ? `👆 Toque na palavra: "${selectedLabel}"`
          : "Toque em uma imagem para começar"}
      </p>

      {/* Grid lado-a-lado — funciona mobile e desktop */}
      <div style={{
        maxWidth:"680px", margin:"0 auto", padding:"0 12px",
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:"10px",
        alignItems:"start"
      }}>

        {/* COLUNA ESQUERDA — Imagens */}
        <div>
          <p style={{
            fontWeight:"700", color:"#374151", fontSize:"11px",
            textTransform:"uppercase", letterSpacing:"0.06em",
            margin:"0 0 8px", textAlign:"center"
          }}>🖼️ Imagem</p>
          <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
            {items.map(card => {
              const isMatched = matched.has(card.id);
              const isSel     = selectedImg === card.id;
              return (
                <button key={card.id}
                  onClick={() => handleImageClick(card.id)}
                  disabled={isMatched}
                  style={{
                    background: isMatched ? "#f0fdf4" : isSel ? "#FFF5F2" : "white",
                    border: `2px solid ${isMatched ? "#16a34a" : isSel ? "#C76B4A" : "#e5e7eb"}`,
                    borderRadius:"12px",
                    padding:"8px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:"6px",
                    cursor: isMatched ? "default" : "pointer",
                    transition:"all 0.2s",
                    minHeight:"64px",
                    boxShadow: isSel ? "0 0 0 3px rgba(199,107,74,0.25)" : "none",
                    width:"100%",
                  }}>
                  <img
                    src={card.image}
                    alt={card.label}
                    style={{width:"44px", height:"44px", objectFit:"contain", borderRadius:"6px", flexShrink:0}}
                  />
                  <span style={{fontSize:"18px"}}>
                    {isMatched ? "✅" : isSel ? "👆" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA — Palavras */}
        <div>
          <p style={{
            fontWeight:"700", color:"#374151", fontSize:"11px",
            textTransform:"uppercase", letterSpacing:"0.06em",
            margin:"0 0 8px", textAlign:"center"
          }}>🔤 Palavra</p>
          <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
            {words.map(word => {
              const isMatched = matched.has(word.id);
              const isWrong   = wrongWord === word.id;
              const isActive  = !!selectedImg && !isMatched;
              return (
                <button key={word.id}
                  onClick={() => handleWordClick(word.id)}
                  disabled={isMatched}
                  style={{
                    background: isMatched ? "#f0fdf4" : isWrong ? "#fef2f2" : isActive ? "#FFF5F2" : "white",
                    border: `2px solid ${isMatched ? "#16a34a" : isWrong ? "#dc2626" : isActive ? "#C76B4A" : "#e5e7eb"}`,
                    borderRadius:"12px",
                    padding:"8px 6px",
                    cursor: isMatched ? "default" : isActive ? "pointer" : "default",
                    fontWeight:"800",
                    fontSize:"13px",
                    color: isMatched ? "#16a34a" : isWrong ? "#dc2626" : "#1B2D5B",
                    textAlign:"center",
                    transition:"all 0.15s",
                    minHeight:"64px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    width:"100%",
                    lineHeight:"1.2",
                  }}>
                  {isMatched ? "✅ " : isWrong ? "❌ " : ""}{word.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}


function Pareamento({ cards, onBack }) {
  const pool = shuffle(cards.filter(c => c && c.image && c.label)).slice(0, 6);
  const [pairs] = useState(() => shuffle([...pool, ...pool].map((c,i) => ({ ...c, uid: `${c.id}-${i}` }))));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  function flip(uid) {
    if (flipped.length === 2 || matched.includes(uid) || flipped.includes(uid)) return;
    const next = [...flipped, uid];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next.map(u => pairs.find(p => p.uid === u));
      if (a.id === b.id) {
        const newMatched = [...matched, a.uid, b.uid];
        setMatched(newMatched);
        setScore(s => s + 1);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  }

  const done = matched.length === pairs.length;
  function restart() { setFlipped([]); setMatched([]); setScore(0); setMoves(0); }

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🃏 Pareamento" score={score} total={pool.length} onBack={onBack} onRestart={restart} />
      {done
        ? <Congratulations score={pool.length} total={pool.length} onRestart={restart} onBack={onBack} />
        : <div style={{maxWidth:"600px",margin:"24px auto",padding:"0 24px"}}>
            <p style={{textAlign:"center",color:"#6b7280",marginBottom:"16px",fontSize:"14px"}}>Movimentos: {moves}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
              {pairs.map(card => {
                const isFlipped = flipped.includes(card.uid) || matched.includes(card.uid);
                return (
                  <button key={card.uid} onClick={() => flip(card.uid)}
                    style={{aspectRatio:"1",borderRadius:"12px",border:`2px solid ${matched.includes(card.uid)?"#16a34a":"#e5e7eb"}`,
                      background:matched.includes(card.uid)?"#f0fdf4":isFlipped?"white":"#1B2D5B",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",padding:"8px"}}>
                    {isFlipped
                      ? <img src={card.image} alt={card.label} style={{width:"100%",height:"100%",objectFit:"contain"}} />
                      : <span style={{fontSize:"24px",color:"rgba(255,255,255,0.3)"}}>?</span>}
                  </button>
                );
              })}
            </div>
          </div>
      }
    </div>
  );
}

function Sequencia({ cards, onBack }) {

  // Frases completas de CAA — usando ids reais dos defaultCards
  // Cada sequencia forma uma frase com sentido real para comunicacao
  const SEQUENCIAS = [
    {
      titulo: "💧 Pedir água",
      frase: "Me dá → Água → Mais",
      instrucao: "Monte a frase para pedir água! Coloque os cards na ordem certa.",
      ids: ["me-da", "agua", "mais"],
    },
    {
      titulo: "🍽️ Pedir comida",
      frase: "Me dá → Comer → Mais",
      instrucao: "Monte a frase para pedir comida! Qual card vem primeiro?",
      ids: ["me-da", "comer", "mais"],
    },
    {
      titulo: "🏁 Acabou a comida",
      frase: "Comer → Mais → Acabou",
      instrucao: "O que acontece durante a refeição? Monte na ordem certa!",
      ids: ["comer", "mais", "acabou"],
    },
    {
      titulo: "🛁 Quero tomar banho",
      frase: "Me dá → Tomar banho → Acabou",
      instrucao: "Monte a frase sobre o banho! Coloque na ordem certa.",
      ids: ["me-da", "tomar-banho", "acabou"],
    },
    {
      titulo: "🌙 Hora de dormir",
      frase: "Tomar banho → Remédio → Dormir",
      instrucao: "O que fazemos antes de dormir? Monte a rotina na ordem certa!",
      ids: ["tomar-banho", "remedio", "dormir"],
    },
    {
      titulo: "🏫 Indo para a escola",
      frase: "Comer → Tomar banho → Escola",
      instrucao: "O que fazemos antes de ir para a escola? Monte na ordem!",
      ids: ["comer", "tomar-banho", "escola"],
    },
    {
      titulo: "🤕 Estou com dor",
      frase: "Dor → Ajuda → Remédio",
      instrucao: "O que fazer quando você está com dor? Monte na ordem certa!",
      ids: ["dor", "ajuda", "remedio"],
    },
    {
      titulo: "🎉 Quero brincar",
      frase: "Me dá → Brincar → Mais",
      instrucao: "Monte a frase para pedir para brincar!",
      ids: ["me-da", "brincar", "mais"],
    },
    {
      titulo: "🚶 Quero sair",
      frase: "Me dá → Sair → Passear",
      instrucao: "Monte a frase para pedir para sair! Qual card vem primeiro?",
      ids: ["me-da", "sair", "passear"],
    },
    {
      titulo: "🚫 Não quero esperar",
      frase: "Não quero → Esperar → Parar",
      instrucao: "Monte a frase para dizer que não quer esperar!",
      ids: ["nao-quero", "esperar", "parar"],
    },
  ];

  // Sequencias sempre disponíveis — cards vêm do mapa global CARDS_FIXOS
  // Não depende da API — imagens e labels sempre corretos
  const seqsDisponiveis = React.useMemo(() => {
    return SEQUENCIAS.map(seq => {
      const cardsCorretos = seq.ids.map(id => cardFixo(id));
      return { ...seq, cardsCorretos };
    });
  }, []);

  const [seqIdx,    setSeqIdx]    = useState(0);
  const [sequence,  setSequence]  = useState([]);
  const [phase,     setPhase]     = useState("escolha"); // escolha | playing | result
  const [score,     setScore]     = useState(0);

  const seqAtual = seqsDisponiveis[seqIdx] || null;
  const correct  = seqAtual ? seqAtual.cardsCorretos : [];
  const [bank, setBank] = useState([]);

  function escolherSequencia(idx) {
    setSeqIdx(idx);
    const seq = seqsDisponiveis[idx];
    setBank(shuffle([...seq.cardsCorretos]));
    setSequence([]);
    setScore(0);
    setPhase("playing");
  }

  function addCard(card) {
    if (sequence.find(s => s.id === card.id)) return;
    const pos  = sequence.length; // proxima posicao
    const ok   = correct[pos] && correct[pos].id === card.id;
    const next = [...sequence, { ...card, ok }];
    setSequence(next);
    setBank(prev => prev.filter(c => c.id !== card.id));
    if (next.length === correct.length) {
      const hits = next.filter(c => c.ok).length;
      setScore(hits);
      setTimeout(() => setPhase("result"), 900);
    }
  }

  function removeCard(idx) {
    const card = sequence[idx];
    if (card.ok) return; // nao pode remover card correto
    // Remove este card e todos os que vierem depois dele
    const removidos = sequence.slice(idx);
    const mantidos  = sequence.slice(0, idx);
    setSequence(mantidos);
    setBank(prev => shuffle([...prev, ...removidos.map(c => ({ ...c, ok: undefined }))]));
  }

  function restart() {
    setBank(shuffle([...correct]));
    setSequence([]);
    setScore(0);
    setPhase("playing");
  }

  function voltar() { setPhase("escolha"); }

  // ---- TELA: SEM SEQUENCIAS ----
  if (seqsDisponiveis.length === 0) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center"}}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>📚</div>
      <h2 style={{color:"#1B2D5B",fontSize:"20px",fontWeight:"800",margin:"0 0 12px"}}>Poucos cards na prancha</h2>
      <p style={{color:"#6b7280",fontSize:"15px",margin:"0 0 24px"}}>Adicione mais cards como "Comer", "Banho", "Escola" e "Dormir" para usar esta atividade.</p>
      <button onClick={onBack} style={{background:"#C76B4A",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontWeight:"700",cursor:"pointer"}}>← Voltar</button>
    </div>
  );

  // ---- TELA: ESCOLHA DE SEQUENCIA ----
  if (phase === "escolha") return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
        <div style={{fontWeight:"700",fontSize:"16px"}}>📖 Sequência</div>
      </div>
      <div style={{maxWidth:"520px",margin:"0 auto",padding:"28px 20px"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"48px",marginBottom:"8px"}}>📖</div>
          <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 8px"}}>Monte uma frase!</h2>
          <p style={{color:"#6b7280",fontSize:"14px",margin:0}}>Escolha uma frase e coloque os cards na ordem certa</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {seqsDisponiveis.map((seq, i) => (
            <button key={i} onClick={() => escolherSequencia(i)}
              style={{
                background:"white", border:"2px solid #e5e7eb",
                borderRadius:"16px", padding:"18px 20px",
                cursor:"pointer", textAlign:"left",
                display:"flex", alignItems:"center", gap:"16px",
                transition:"all 0.2s",
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)"
              }}>
              <div style={{fontSize:"32px",flexShrink:0}}>{seq.titulo.split(" ")[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:"800",color:"#1B2D5B",fontSize:"16px",marginBottom:"4px"}}>
                  {seq.titulo.split(" ").slice(1).join(" ")}
                </div>
                <div style={{
                  background:"#f0f4ff",borderRadius:"8px",padding:"6px 10px",
                  fontSize:"13px",fontWeight:"700",color:"#1B2D5B",
                  margin:"4px 0 6px",letterSpacing:"0.01em"
                }}>
                  🗣️ {seq.frase}
                </div>
                <div style={{color:"#6b7280",fontSize:"12px"}}>{seq.instrucao}</div>
              </div>
              <div style={{fontSize:"20px",color:"#C76B4A"}}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ---- TELA RESULTADO ----
  if (phase === "result") {
    const pct = Math.round((score / correct.length) * 100);
    return (
      <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
        <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
          <button onClick={voltar} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Outras histórias</button>
          <div style={{fontWeight:"700",fontSize:"16px"}}>📖 Sequência</div>
        </div>
        <div style={{maxWidth:"600px",margin:"40px auto",padding:"0 24px",textAlign:"center"}}>
          <div style={{fontSize:"56px",marginBottom:"12px"}}>{pct===100?"🏆":pct>=60?"⭐":"💪"}</div>
          <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 6px"}}>
            {pct===100?"Perfeito! Você acertou tudo!":pct>=60?"Muito bem! Quase lá!":"Continue praticando!"}
          </h2>
          <p style={{color:"#6b7280",margin:"0 0 8px"}}>{seqAtual.titulo}</p>
          <p style={{color:"#6b7280",margin:"0 0 28px",fontSize:"14px"}}>{score} de {correct.length} cards na posição certa</p>

          <div style={{marginBottom:"24px"}}>
            <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Sua sequência</p>
            <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap"}}>
              {sequence.map((c, i) => {
                const ok = c.id === correct[i].id;
                return (
                  <div key={c.id} style={{background:ok?"#f0fdf4":"#fef2f2",border:`2px solid ${ok?"#16a34a":"#dc2626"}`,borderRadius:"10px",padding:"10px",textAlign:"center",minWidth:"80px"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:ok?"#16a34a":"#dc2626",marginBottom:"4px"}}>{ok?"✅":"❌"} {i+1}º</div>
                    <img src={c.image} alt={c.label} style={{width:"44px",height:"44px",objectFit:"contain"}} />
                    <div style={{fontSize:"12px",color:"#374151",fontWeight:"600",marginTop:"4px"}}>{c.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {pct < 100 && (
            <div style={{marginBottom:"28px"}}>
              <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Ordem correta</p>
              <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap"}}>
                {correct.map((c, i) => (
                  <div key={c.id} style={{background:"white",border:"2px solid #1B2D5B",borderRadius:"10px",padding:"10px",textAlign:"center",minWidth:"80px"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:"#1B2D5B",marginBottom:"4px"}}>{i+1}º</div>
                    <img src={c.image} alt={c.label} style={{width:"44px",height:"44px",objectFit:"contain"}} />
                    <div style={{fontSize:"12px",color:"#374151",fontWeight:"600",marginTop:"4px"}}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={restart} style={{background:"#C76B4A",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontWeight:"700",cursor:"pointer",fontSize:"15px"}}>🔄 Tentar novamente</button>
            <button onClick={voltar} style={{background:"white",color:"#374151",border:"1px solid #e5e7eb",padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontSize:"15px"}}>← Outras histórias</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- TELA DE JOGO ----
  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
        <button onClick={voltar} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Outras histórias</button>
        <div style={{fontWeight:"700",fontSize:"16px"}}>📖 Sequência</div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <span style={{background:"rgba(255,255,255,0.1)",padding:"6px 14px",borderRadius:"20px",fontSize:"13px"}}>
            {sequence.length}/{correct.length} colocados
          </span>
          <button onClick={restart} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>🔄</button>
        </div>
      </div>

      <div style={{maxWidth:"700px",margin:"0 auto",padding:"20px"}}>

        {/* OBJETIVO DA SEQUENCIA */}
        <div style={{background:"#1B2D5B",borderRadius:"14px",padding:"14px 20px",marginBottom:"20px",textAlign:"center"}}>
          <div style={{color:"#E8B4A8",fontSize:"12px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>
            {seqAtual.titulo}
          </div>
          <div style={{color:"white",fontSize:"15px",fontWeight:"600"}}>
            {seqAtual.instrucao}
          </div>
        </div>

        {/* ZONA DA SEQUENCIA */}
        <div style={{marginBottom:"24px"}}>
          <p style={{fontWeight:"700",color:"#374151",marginBottom:"10px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"center"}}>
            Sua sequência — toque em ✕ para remover
          </p>
          <div style={{
            display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",
            minHeight:"110px",background:"white",borderRadius:"16px",
            border:"2px dashed #e5e7eb",padding:"12px",alignItems:"center"
          }}>
            {sequence.length === 0 && (
              <div style={{textAlign:"center"}}>
                <p style={{color:"#9ca3af",fontSize:"14px",margin:"0 0 4px"}}>
                  👇 Toque nos cards abaixo para montar a frase
                </p>
                <p style={{color:"#C76B4A",fontSize:"13px",fontWeight:"700",margin:0}}>
                  ✅ Card certo = fica verde e travado!
                </p>
              </div>
            )}
            {sequence.map((c, i) => (
              <div key={c.id} style={{
                background: c.ok ? "#f0fdf4" : "#fef2f2",
                border: `2px solid ${c.ok ? "#16a34a" : "#dc2626"}`,
                borderRadius:"10px", padding:"8px", textAlign:"center",
                minWidth:"76px", position:"relative",
                transition:"all 0.3s"
              }}>
                {/* So mostra X se o card esta ERRADO */}
                {!c.ok && (
                  <button onClick={() => removeCard(i)}
                    style={{position:"absolute",top:"-8px",right:"-8px",background:"#dc2626",border:"none",color:"white",borderRadius:"50%",width:"22px",height:"22px",fontSize:"12px",cursor:"pointer",fontWeight:"800",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
                )}
                {/* Badge de certo/errado */}
                <div style={{
                  fontSize:"11px", fontWeight:"800", marginBottom:"4px",
                  color: c.ok ? "#16a34a" : "#dc2626"
                }}>
                  {c.ok ? "✅ Certo!" : "❌ Errado"}
                </div>
                <img src={c.image} alt={c.label} style={{width:"44px",height:"44px",objectFit:"contain"}} />
                <div style={{fontSize:"11px",color: c.ok ? "#16a34a" : "#dc2626",fontWeight:"700",marginTop:"4px"}}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BANCO DE CARDS */}
        <div>
          <p style={{fontWeight:"700",color:"#374151",marginBottom:"10px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"center"}}>
            Cards disponíveis — toque para adicionar
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"12px"}}>
            {bank.map(card => (
              <button key={card.id} onClick={() => addCard(card)}
                style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"12px",padding:"12px 8px",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                <img src={card.image} alt={card.label} style={{width:"56px",height:"56px",objectFit:"contain"}} />
                <div style={{fontSize:"12px",fontWeight:"700",color:"#1B2D5B",marginTop:"6px"}}>{card.label}</div>
              </button>
            ))}
            {bank.length === 0 && (
              <div style={{gridColumn:"1/-1",textAlign:"center",color:"#9ca3af",fontSize:"14px",padding:"20px 0"}}>
                Todos colocados! Confira sua sequência acima.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function CompletarFrase({ cards, onBack }) {

  // ── IDs VÁLIDOS: exatamente os 18 do FALLBACK ──────────────────────────
  // Qualquer card extra da API (lanche, cansado, tomar-banho...) é ignorado
  const IDS_VALIDOS = ["sim","nao","ajuda","mais","agua","comer","banheiro",
    "dormir","feliz","triste","medo","bravo","brincar","parar","esperar",
    "dor","remedio","escola"];

  // ── IMAGENS FIXAS por id ─────────────────────────────────────────────────
  // Labels fixos por id — ignora label corrompido da API
  const LABEL = {
    "sim":"Sim","nao":"Não","ajuda":"Ajuda","mais":"Mais",
    "agua":"Água","comer":"Comer","banheiro":"Banheiro","dormir":"Dormir",
    "feliz":"Feliz","triste":"Triste","medo":"Medo","bravo":"Bravo",
    "brincar":"Brincar","parar":"Parar","esperar":"Esperar",
    "dor":"Dor","remedio":"Remédio","escola":"Escola",
  };

  const IMG = {
    "sim":"/cards/level-1/sim.webp?v=20260521-optimized",
    "nao":"/cards/level-1/nao.webp?v=20260521-optimized",
    "ajuda":"/cards/level-1/ajuda.webp?v=20260521-optimized",
    "mais":"/cards/level-1/mais.webp?v=20260521-optimized",
    "agua":"/cards/level-1/agua.webp?v=20260521-optimized",
    "comer":"/cards/level-1/comer.webp?v=20260521-optimized",
    "banheiro":"/cards/level-1/banheiro.webp?v=20260521-optimized",
    "dormir":"/cards/level-1/dormir.webp?v=20260521-optimized",
    "feliz":"/cards/level-1/feliz.webp?v=20260521-optimized",
    "triste":"/cards/level-1/triste.webp?v=20260521-optimized",
    "medo":"/cards/level-1/medo.webp?v=20260521-optimized",
    "bravo":"/cards/level-1/bravo.webp?v=20260521-optimized",
    "brincar":"/cards/level-1/brincar.webp?v=20260521-optimized",
    "parar":"/cards/level-1/parar.webp?v=20260521-optimized",
    "esperar":"/cards/level-1/esperar.webp?v=20260521-optimized",
    "dor":"/cards/level-1/dor.webp?v=20260521-optimized",
    "remedio":"/cards/level-1/remedio.webp?v=20260521-optimized",
    "escola":"/cards/level-1/escola.webp?v=20260521-optimized",
  };

  // ── FRASES: construídas A PARTIR do card correto ─────────────────────────
  // id = card correto | t = template | d = 3 distratores | dica = situação
  // Todos os ids (id + d) pertencem a IDS_VALIDOS
  const FRASES_BASE = [
    { id:"agua",     t:"Eu quero ___",          d:["comer","brincar","dormir"],   dica:"Você está com sede. O que você quer?" },
    { id:"comer",    t:"Eu quero ___",          d:["agua","brincar","dormir"],    dica:"Sua barriga está roncando. O que você quer?" },
    { id:"dormir",   t:"Eu quero ___",          d:["comer","brincar","agua"],     dica:"Seus olhos estão pesados. O que você quer?" },
    { id:"brincar",  t:"Eu quero ___",          d:["comer","dormir","esperar"],   dica:"Você quer se divertir. O que você quer fazer?" },
    { id:"banheiro", t:"Eu preciso ir ao ___",  d:["escola","comer","dormir"],    dica:"Você precisa fazer xixi. Para onde você vai?" },
    { id:"escola",   t:"Eu vou para a ___",     d:["banheiro","comer","brincar"], dica:"É hora de estudar. Para onde você vai?" },
    { id:"ajuda",    t:"Eu preciso de ___",     d:["agua","comer","remedio"],     dica:"Você não consegue fazer sozinho. O que você pede?" },
    { id:"remedio",  t:"Eu preciso de ___",     d:["agua","ajuda","comer"],       dica:"Você está doente. O que você precisa tomar?" },
    { id:"dor",      t:"Eu estou com ___",      d:["medo","bravo","triste"],      dica:"Algo está machucando seu corpo. O que você sente?" },
    { id:"medo",     t:"Eu estou com ___",      d:["dor","bravo","triste"],       dica:"Algo te assustou. O que você está sentindo?" },
    { id:"feliz",    t:"Eu estou ___",          d:["triste","bravo","medo"],      dica:"Algo bom aconteceu. Como você está?" },
    { id:"triste",   t:"Eu estou ___",          d:["feliz","bravo","medo"],       dica:"Algo ruim aconteceu. Como você está?" },
    { id:"bravo",    t:"Eu estou ___",          d:["feliz","triste","medo"],      dica:"Algo te irritou muito. Como você está?" },
    { id:"esperar",  t:"Preciso ___",           d:["parar","brincar","dormir"],   dica:"Ainda não é sua vez. O que você faz?" },
    { id:"parar",    t:"Quero ___",             d:["esperar","brincar","dormir"], dica:"Você não quer mais continuar. O que você diz?" },
    { id:"mais",     t:"Eu quero ___",          d:["parar","esperar","dormir"],   dica:"Você gostou e quer repetir. O que você fala?" },
    { id:"sim",      t:"A resposta é ___",      d:["nao","parar","esperar"],      dica:"Você concorda. Qual card você usa?" },
    { id:"nao",      t:"A resposta é ___",      d:["sim","parar","esperar"],      dica:"Você não quer. Qual card você usa?" },
  ];

  // ── cardMap: SOMENTE ids em IDS_VALIDOS, imagem sempre do IMG fixo ───────
  const cardMap = React.useMemo(() => {
    const validSet = new Set(IDS_VALIDOS);
    const m = {};
    for (const c of (cards || [])) {
      if (!c || !c.id) continue;
      const id = String(c.id).trim();
      if (!validSet.has(id)) continue;          // bloqueia cansado, lanche, etc.
      m[id] = { ...c, id, image: IMG[id], label: LABEL[id] };  // imagem e label sempre fixos
    }
    return m;
  }, [cards]);

  // ── Frases disponíveis: correta + exatamente 3 distratores no cardMap ────
  const frasesDisponiveis = React.useMemo(() =>
    FRASES_BASE.filter(f =>
      !!cardMap[f.id] && f.d.length === f.d.filter(id => !!cardMap[id]).length
    )
  , [cardMap]);

  // ── Rodada: até 8 frases embaralhadas ────────────────────────────────────
  const rodada = React.useMemo(() => {
    if (!frasesDisponiveis.length) return [];
    return shuffle([...frasesDisponiveis]).slice(0, 8);
  }, [frasesDisponiveis.length]);

  const [idx,      setIdx]      = useState(0);
  const [score,    setScore]    = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [escolha,  setEscolha]  = useState(null);
  const [done,     setDone]     = useState(false);

  const frase = rodada[idx] ?? null;

  // ── Opções: 1 correta + 3 distratores, todos do cardMap filtrado ─────────
  const options = React.useMemo(() => {
    if (!frase) return [];
    const correta = cardMap[frase.id];
    if (!correta) return [];
    const dist = frase.d.map(id => cardMap[id]).filter(Boolean);
    return shuffle([correta, ...dist]);
  }, [frase, cardMap]);

  useEffect(() => { setFeedback(null); setEscolha(null); }, [idx]);

  function pick(card) {
    if (feedback || !card || !frase) return;
    const ok = String(card.id).trim() === frase.id;
    setEscolha(card.id);
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= rodada.length) setDone(true);
      else setIdx(i => i + 1);
    }, 1500);
  }

  function restart() {
    setIdx(0); setScore(0); setFeedback(null); setEscolha(null); setDone(false);
  }

  if (!frasesDisponiveis.length) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center"}}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>💬</div>
      <h2 style={{color:"#1B2D5B",fontSize:"20px",fontWeight:"800",margin:"0 0 12px"}}>Poucos cards na prancha</h2>
      <p style={{color:"#6b7280",fontSize:"15px",margin:"0 0 24px"}}>Adicione cards como "Água", "Comer", "Feliz" e "Dor" para usar esta atividade.</p>
      <button onClick={onBack} style={{background:"#C76B4A",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontWeight:"700",cursor:"pointer"}}>← Voltar</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="💬 Completar Frase" score={score} total={rodada.length} onBack={onBack} onRestart={restart} />
      {done
        ? <Congratulations score={score} total={rodada.length} onRestart={restart} onBack={onBack} />
        : frase && (
          <div style={{maxWidth:"520px",margin:"32px auto",padding:"0 20px"}}>

            <div style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"20px",padding:"28px 24px",textAlign:"center",marginBottom:"24px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:"12px",fontWeight:"700",color:"#C76B4A",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.07em"}}>
                Pergunta {idx+1} de {rodada.length}
              </div>
              <div style={{fontSize:"26px",fontWeight:"800",color:"#1B2D5B",marginBottom:"12px",lineHeight:"1.3"}}>
                {frase.t}
              </div>
              <div style={{display:"inline-block",background:"#EEF2FF",borderRadius:"10px",padding:"8px 16px",fontSize:"14px",color:"#3730a3",fontWeight:"600",lineHeight:"1.4"}}>
                💡 {frase.dica}
              </div>
            </div>

            {feedback && (
              <div style={{textAlign:"center",marginBottom:"16px",padding:"12px",borderRadius:"12px",background:feedback==="correct"?"#f0fdf4":"#fef2f2",border:`2px solid ${feedback==="correct"?"#16a34a":"#dc2626"}`,fontSize:"18px",fontWeight:"800",color:feedback==="correct"?"#16a34a":"#dc2626"}}>
                {feedback==="correct" ? "✅ Correto! Muito bem!" : "❌ Não foi dessa vez..."}
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {options.map(card => {
                const isCorreta  = String(card.id).trim() === frase.id;
                const isSelecion = escolha === card.id;
                let bg = "white", border = "#e5e7eb";
                if (feedback && isCorreta)           { bg="#f0fdf4"; border="#16a34a"; }
                else if (feedback && isSelecion)     { bg="#fef2f2"; border="#dc2626"; }
                return (
                  <button key={card.id} onClick={() => pick(card)} disabled={!!feedback}
                    style={{background:bg,border:`2px solid ${border}`,borderRadius:"14px",padding:"16px 12px",cursor:feedback?"default":"pointer",textAlign:"center",transition:"all 0.25s",boxShadow:!feedback?"0 2px 8px rgba(0,0,0,0.04)":"none"}}>
                    <img src={IMG[card.id]} alt={card.label} style={{width:"68px",height:"68px",objectFit:"contain",display:"block",margin:"0 auto 8px"}} />
                    <div style={{fontWeight:"700",fontSize:"14px",color:"#1B2D5B"}}>{card.label}</div>
                    {feedback && isCorreta    && <div style={{fontSize:"12px",color:"#16a34a",fontWeight:"700",marginTop:"4px"}}>✅ Resposta certa!</div>}
                    {feedback && isSelecion && !isCorreta && <div style={{fontSize:"12px",color:"#dc2626",fontWeight:"700",marginTop:"4px"}}>❌ Errado</div>}
                  </button>
                );
              })}
            </div>

          </div>
        )
      }
    </div>
  );
}


function Categorizar({ cards, onBack }) {
  const ALL_CAT_META = {
    core:         { label:"⭐ Essenciais",   color:"#2563eb", bg:"#eff6ff" },
    necessidades: { label:"🍎 Necessidades", color:"#059669", bg:"#ecfdf5" },
    emocoes:      { label:"😊 Emoções",      color:"#d97706", bg:"#fffbeb" },
    acoes:        { label:"🏃 Ações",         color:"#7c3aed", bg:"#f5f3ff" },
    lugares:      { label:"📍 Lugares",       color:"#0891b2", bg:"#ecfeff" },
    saude:        { label:"❤️ Saúde",         color:"#e11d48", bg:"#fff1f2" },
  };
  const PHASE = { INTRO:"intro", PLAYING:"playing", DONE:"done" };
  const [phase, setPhase]           = useState(PHASE.INTRO);
  const [pool, setPool]             = useState([]);
  const [queue, setQueue]           = useState([]);
  const [current, setCurrent]       = useState(null);
  const [queueIdx, setQueueIdx]     = useState(0);
  const [score, setScore]           = useState(0);
  const [feedback, setFeedback]     = useState(null);
  const [activeCats, setActiveCats] = useState([]);
  const [roundCats, setRoundCats]   = useState([]);

  useEffect(() => {
    if (!cards?.length) return;
    const valid = cards.filter(c => c && c.cat && ALL_CAT_META[c.cat]);
    setPool(shuffle(valid));
    setActiveCats([...new Set(valid.map(c => c.cat))]);
  }, [cards]);

  function startGame() {
    if (!pool.length) return;
    const p = shuffle([...pool]).slice(0, 12);
    const cats = [...new Set(p.map(c => c.cat))];
    const allCats = [...new Set(pool.map(c => c.cat))];
    setRoundCats(cats.length >= 2 ? cats : allCats.slice(0, 4));
    setQueue(p); setCurrent(p[0]); setQueueIdx(0);
    setScore(0); setFeedback(null); setPhase(PHASE.PLAYING);
  }

  function pick(cat) {
    if (feedback || !current) return;
    const correct = cat === current.cat;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      const next = queueIdx + 1;
      if (next >= queue.length) { setPhase(PHASE.DONE); return; }
      setQueueIdx(next); setCurrent(queue[next]); setFeedback(null);
    }, 1200);
  }

  function restart() { startGame(); }

  if (!pool.length) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🗂️ Categorização" score={0} total={0} onBack={onBack} onRestart={() => {}} />
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>⏳</div>
        <p style={{color:"#6b7280"}}>Carregando cards…</p>
      </div>
    </div>
  );

  if (phase === PHASE.INTRO) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🗂️ Categorização" score={0} total={0} onBack={onBack} onRestart={() => {}} />
      <div style={{maxWidth:"480px",margin:"0 auto",padding:"24px 20px"}}>
        <div style={{background:"white",borderRadius:"20px",padding:"28px 24px",
                     boxShadow:"0 2px 16px rgba(0,0,0,0.08)",marginBottom:"24px",textAlign:"center"}}>
          <div style={{fontSize:"52px",marginBottom:"12px"}}>🗂️</div>
          <h2 style={{fontSize:"22px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 12px"}}>
            Jogo de Categorização
          </h2>
          <p style={{color:"#4b5563",fontSize:"15px",lineHeight:"1.6",margin:"0 0 16px"}}>
            Veja a <strong>imagem</strong> e a <strong>palavra</strong> no card
            e toque na <strong>categoria</strong> correta abaixo! 👇
          </p>
          <div style={{background:"#eff6ff",borderRadius:"12px",padding:"16px",
                       textAlign:"left",marginBottom:"16px",borderLeft:"4px solid #2563eb"}}>
            <p style={{fontSize:"13px",color:"#1e40af",margin:0,lineHeight:"1.6"}}>
              💡 <strong>Por que fazemos isso?</strong><br/>
              Categorizar ajuda a <strong>organizar o pensamento</strong>, ampliar o vocabulário
              e facilitar a comunicação — essencial para o desenvolvimento da linguagem
              em crianças com autismo e TDAH.
            </p>
          </div>
          <div style={{background:"#f9fafb",borderRadius:"12px",padding:"14px",marginBottom:"20px",textAlign:"left"}}>
            <p style={{fontSize:"13px",color:"#374151",margin:0,lineHeight:"1.7"}}>
              <strong>Como jogar:</strong><br/>
              1️⃣ Um card aparece com imagem e palavra<br/>
              2️⃣ Toque na categoria correta<br/>
              3️⃣ Verde = acerto ✅ · Vermelho = erro ❌<br/>
              4️⃣ Veja a pontuação no final!
            </p>
          </div>
          <p style={{fontSize:"13px",color:"#6b7280",marginBottom:"8px",fontWeight:"600"}}>
            Categorias deste jogo:
          </p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px",justifyContent:"center",marginBottom:"24px"}}>
            {activeCats.map(cat => (
              <span key={cat} style={{
                background:ALL_CAT_META[cat].bg,
                border:`2px solid ${ALL_CAT_META[cat].color}60`,
                color:ALL_CAT_META[cat].color,
                borderRadius:"20px",padding:"6px 14px",
                fontSize:"13px",fontWeight:"700"
              }}>{ALL_CAT_META[cat].label}</span>
            ))}
          </div>
          <button onClick={startGame} style={{
            background:"#1B2D5B",color:"white",border:"none",borderRadius:"14px",
            padding:"16px 40px",fontSize:"17px",fontWeight:"800",cursor:"pointer",width:"100%",
            boxShadow:"0 4px 12px rgba(27,45,91,0.3)"
          }}>🚀 Começar!</button>
        </div>
        <p style={{textAlign:"center",color:"#9ca3af",fontSize:"12px"}}>
          {pool.length} cards disponíveis · até 12 por rodada
        </p>
      </div>
    </div>
  );

  if (phase === PHASE.DONE)
    return <Congratulations score={score} total={queue.length} onRestart={restart} onBack={onBack} />;

  const fbBorder = feedback==="correct" ? "3px solid #10b981" : feedback==="wrong" ? "3px solid #ef4444" : "2px solid #e5e7eb";
  const fbBg     = feedback==="correct" ? "#f0fdf4" : feedback==="wrong" ? "#fef2f2" : "white";
  const catCols  = roundCats.length <= 4 ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui",paddingBottom:"32px"}}>
      <GameHeader title="🗂️ Categorização" score={score} total={queue.length} onBack={onBack} onRestart={restart} />
      <div style={{maxWidth:"480px",margin:"0 auto",padding:"16px 16px 0"}}>
        <div style={{marginBottom:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#9ca3af",marginBottom:"6px"}}>
            <span>Progresso</span><span>{queueIdx + 1} / {queue.length}</span>
          </div>
          <div style={{background:"#e5e7eb",borderRadius:"99px",height:"8px"}}>
            <div style={{background:"#1B2D5B",borderRadius:"99px",height:"8px",
              width:`${((queueIdx+1)/queue.length)*100}%`,transition:"width 0.4s ease"}} />
          </div>
        </div>
        <div style={{border:fbBorder,background:fbBg,borderRadius:"20px",padding:"20px 20px 16px",
                     textAlign:"center",marginBottom:"16px",transition:"all 0.2s",
                     boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          {current.image ? (
            <img src={current.image} alt={current.label} style={{
              width:"120px",height:"120px",objectFit:"contain",
              borderRadius:"12px",border:"2px solid #f3f4f6",
              display:"block",margin:"0 auto 12px"
            }} />
          ) : (
            <div style={{width:"120px",height:"120px",background:"#f3f4f6",borderRadius:"12px",
                         display:"flex",alignItems:"center",justifyContent:"center",
                         margin:"0 auto 12px",fontSize:"40px"}}>🖼️</div>
          )}
          <div style={{fontSize:"26px",fontWeight:"800",color:"#1B2D5B",marginBottom:"6px",lineHeight:1.2}}>
            {current.label}
          </div>
          {feedback && (
            <div style={{fontSize:"44px",marginTop:"6px",animation:"popIn 0.3s ease"}}>
              {feedback==="correct" ? "✅" : "❌"}
            </div>
          )}
          {feedback==="wrong" && (
            <div style={{fontSize:"13px",color:"#ef4444",marginTop:"6px",fontWeight:"700",
                         background:"#fee2e2",borderRadius:"8px",padding:"6px 12px",display:"inline-block"}}>
              Pertencia a: {ALL_CAT_META[current.cat]?.label}
            </div>
          )}
          {feedback==="correct" && (
            <div style={{fontSize:"13px",color:"#059669",marginTop:"6px",fontWeight:"700",
                         background:"#d1fae5",borderRadius:"8px",padding:"6px 12px",display:"inline-block"}}>
              Parabéns! 🎉
            </div>
          )}
        </div>
        <p style={{textAlign:"center",color:"#6b7280",marginBottom:"12px",fontSize:"14px",fontWeight:"600"}}>
          👆 A qual categoria este card pertence?
        </p>
        <div style={{display:"grid",gridTemplateColumns:catCols,gap:"10px"}}>
          {roundCats.map(cat => {
            const m = ALL_CAT_META[cat];
            const isCorrectAnswer = feedback && cat===current.cat;
            return (
              <button key={cat} onClick={() => pick(cat)} disabled={!!feedback} style={{
                background: isCorrectAnswer ? m.color : m.bg,
                border:`2px solid ${isCorrectAnswer ? m.color : m.color+"60"}`,
                borderRadius:"14px",padding:"14px 8px",
                cursor:feedback ? "default" : "pointer",
                fontWeight:"800",fontSize:"14px",
                color: isCorrectAnswer ? "white" : m.color,
                lineHeight:"1.3",transition:"all 0.15s ease",
                opacity: feedback && !isCorrectAnswer ? 0.5 : 1,
                transform: isCorrectAnswer ? "scale(1.04)" : "scale(1)",
                boxShadow: isCorrectAnswer ? `0 4px 12px ${m.color}40` : "none",
                minHeight:"56px"
              }}>{m.label}</button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes popIn{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        @media(max-width:400px){button{font-size:13px!important;padding:12px 6px!important}}
      `}</style>
    </div>
  );
}
