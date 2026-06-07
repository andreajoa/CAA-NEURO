"use client";
import React from "react";
import AppShell from "../components/AppShell";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  // Pool gerado UMA vez com useMemo — nunca muda entre renders
  // items e words derivados do MESMO pool congelado — ids sempre batem
  const pool = React.useMemo(() => {
    const seen = new Set();
    const unique = [];
    for (const c of (cards || [])) {
      if (c && c.image && c.label && c.id && !seen.has(String(c.id))) {
        seen.add(String(c.id));
        unique.push({ ...c, id: String(c.id).trim().normalize("NFC"), label: String(c.label||"").trim() });
      }
    }
    return shuffle(unique).slice(0, 6);
  }, [cards]);

  const [items,       setItems]       = useState([]);
  const [words,       setWords]       = useState([]);
  const [matched,     setMatched]     = useState(new Set());
  const [selectedImg, setSelectedImg] = useState(null);
  const [wrongWord,   setWrongWord]   = useState(null);
  const [score,       setScore]       = useState(0);
  const [done,        setDone]        = useState(false);

  function init() {
    // Pool ja esta pronto e congelado — usa ele diretamente
    // items = pool (ordem fixa)
    // words = mesmos ids do pool, so o label, embaralhados
    const frozenItems = [...pool]; // copia segura
    const frozenWords = shuffle(frozenItems.map(c => ({ id: c.id, label: c.label })));
    
    // Verifica que todos os ids de words existem em items
    const itemIds = new Set(frozenItems.map(c => c.id));
    const allMatch = frozenWords.every(w => itemIds.has(w.id));
    if (!allMatch) {
      console.error("ERRO: words tem ids que nao existem em items!");
    }
    
    setItems(frozenItems);
    setWords(frozenWords);
    setMatched(new Set());
    setSelectedImg(null);
    setWrongWord(null);
    setScore(0);
    setDone(false);
  }

  useEffect(() => { init(); }, [pool]);

  function handleImageClick(imgId) {
    const normId = String(imgId||"").trim().normalize("NFC");
    if (matched.has(normId)) return;
    setSelectedImg(prev => prev === normId ? null : normId);
    setWrongWord(null);
  }

  function handleWordClick(wordId) {
    if (!selectedImg) return;
    const selNorm  = String(selectedImg||"").trim().normalize("NFC");
    const wordNorm = String(wordId||"").trim().normalize("NFC");
    if (matched.has(selNorm)) return;
    if (matched.has(wordNorm)) return;

    if (selNorm === wordNorm) {
      const newMatched = new Set(matched);
      newMatched.add(selNorm); // sempre o id normalizado
      setMatched(newMatched);
      setScore(s => s + 1);
      setSelectedImg(null);
      setWrongWord(null);
      if (newMatched.size === items.length) {
        setTimeout(() => setDone(true), 400);
      }
    } else {
      setWrongWord(wordNorm);
      setTimeout(() => setWrongWord(null), 700);
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

      <p style={{
        textAlign:"center", margin:"14px 0 10px",
        fontSize:"14px", fontWeight: selectedImg ? "700" : "400",
        color: selectedImg ? "#C76B4A" : "#9ca3af",
        transition:"color 0.2s"
      }}>
        {selectedImg
          ? `👆 Toque na palavra correta para "${selectedLabel}"`
          : "Toque em uma imagem para selecionar"}
      </p>

      <div style={{maxWidth:"660px",margin:"0 auto",padding:"0 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"start"}}>

        {/* IMAGENS — ordem fixa */}
        <div>
          <p style={{fontWeight:"700",color:"#374151",fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px",textAlign:"center"}}>🖼️ Imagem</p>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {items.map(card => {
              const normCardId = String(card.id||"").trim().normalize("NFC");
              const isMatched = matched.has(normCardId);
              const isSel     = selectedImg === normCardId;
              return (
                <button key={normCardId} onClick={() => handleImageClick(normCardId)} disabled={isMatched}
                  style={{
                    background: isMatched?"#f0fdf4": isSel?"#FFF5F2":"white",
                    border:`2px solid ${isMatched?"#16a34a":isSel?"#C76B4A":"#e5e7eb"}`,
                    borderRadius:"12px", padding:"10px 12px",
                    display:"flex", alignItems:"center", gap:"10px",
                    cursor:isMatched?"default":"pointer",
                    transition:"all 0.2s", minHeight:"70px",
                    boxShadow:isSel?"0 0 0 3px rgba(199,107,74,0.2)":"none"
                  }}>
                  <img src={card.image} alt={card.label}
                    style={{width:"46px",height:"46px",objectFit:"contain",borderRadius:"8px",flexShrink:0}}
                    onError={e=>{e.target.style.display="none"}} />
                  <span style={{fontSize:"20px"}}>
                    {isMatched?"✅":isSel?"👆":""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PALAVRAS — embaralhadas, ids garantidos do mesmo pool */}
        <div>
          <p style={{fontWeight:"700",color:"#374151",fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px",textAlign:"center"}}>🔤 Palavra</p>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {words.map(word => {
              const normWordId = String(word.id||"").trim().normalize("NFC");
              const isMatched = matched.has(normWordId);
              const isWrong   = wrongWord === normWordId;
              const isActive  = !!selectedImg && !isMatched;
              return (
                <button key={normWordId} onClick={() => handleWordClick(normWordId)} disabled={isMatched}
                  style={{
                    background: isMatched?"#f0fdf4":isWrong?"#fef2f2":isActive?"#FFF5F2":"white",
                    border:`2px solid ${isMatched?"#16a34a":isWrong?"#dc2626":isActive?"#C76B4A":"#e5e7eb"}`,
                    borderRadius:"12px", padding:"10px 14px",
                    cursor:isMatched?"default":isActive?"pointer":"default",
                    fontWeight:"700", fontSize:"15px",
                    color:isMatched?"#16a34a":isWrong?"#dc2626":"#1B2D5B",
                    textAlign:"center", transition:"all 0.15s",
                    minHeight:"70px", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    gap:"6px", opacity:1
                  }}>
                  {isMatched?"✅ ":isWrong?"❌ ":""}{word.label}
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

  // Monta o pool de cards disponíveis do usuario
  const cardMap = React.useMemo(() => {
    const m = {};
    for (const c of (cards || [])) {
      if (c && c.id) m[String(c.id).trim()] = c;
    }
    return m;
  }, [cards]);

  // Escolhe sequencias que o usuario tem TODOS os cards necessarios
  const seqsDisponiveis = React.useMemo(() => {
    return SEQUENCIAS.map(seq => {
      // So mostra a historia se o usuario tem TODOS os cards dela
      const cardsCorretos = seq.ids.map(id => cardMap[id]).filter(Boolean);
      if (cardsCorretos.length === seq.ids.length) {
        return { ...seq, cardsCorretos };
      }
      return null;
    }).filter(Boolean);
  }, [cardMap]);

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
  const CATS = ["core","necessidades","emocoes","acoes"];
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [queueIdx, setQueueIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!cards?.length) return;
    const pool = shuffle(cards.filter(c => c && CATS.includes(c.cat))).slice(0, 12);
    if (!pool.length) return;
    setQueue(pool);
    setCurrent(pool[0]);
    setQueueIdx(0);
    setScore(0);
    setFeedback(null);
    setDone(false);
  }, [cards]);

  const CAT_LABELS = { core:"⭐ Essenciais", necessidades:"🍎 Necessidades", emocoes:"😊 Emoções", acoes:"🏃 Ações" };
  const CAT_COLORS = { core:"#2563eb", necessidades:"#059669", emocoes:"#d97706", acoes:"#7c3aed" };

  function pick(cat) {
    if (feedback || !current) return;
    const correct = cat === current.cat;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      const next = queueIdx + 1;
      if (next >= queue.length) setDone(true);
      else { setQueueIdx(next); setCurrent(queue[next]); setFeedback(null); }
    }, 1000);
  }

  function restart() {
    const p = shuffle(queue);
    setQueue(p); setCurrent(p[0]); setQueueIdx(0); setScore(0); setFeedback(null); setDone(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🗂️ Categorização" score={score} total={queue.length} onBack={onBack} onRestart={restart} />
      {done
        ? <Congratulations score={score} total={queue.length} onRestart={restart} onBack={onBack} />
        : current && (
          <div style={{maxWidth:"480px",margin:"40px auto",padding:"0 24px"}}>
            <div style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"20px",padding:"32px",textAlign:"center",marginBottom:"28px"}}>
              <div style={{fontSize:"12px",color:"#9ca3af",marginBottom:"16px"}}>{queueIdx+1} / {queue.length}</div>
              {current.image && <img src={current.image} alt={current.label} style={{width:"100px",height:"100px",objectFit:"contain",marginBottom:"16px"}} />}
              <div style={{fontSize:"22px",fontWeight:"800",color:"#1B2D5B"}}>{current.label}</div>
              {feedback && <div style={{marginTop:"12px",fontSize:"22px"}}>{feedback==="correct"?"✅":"❌"}</div>}
            </div>
            <p style={{textAlign:"center",color:"#6b7280",marginBottom:"16px",fontSize:"14px"}}>A qual categoria este card pertence?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {CATS.map(cat => (
                <button key={cat} onClick={() => pick(cat)}
                  style={{background:`${CAT_COLORS[cat]}15`,border:`2px solid ${CAT_COLORS[cat]}40`,borderRadius:"12px",padding:"16px",cursor:"pointer",fontWeight:"700",fontSize:"15px",color:CAT_COLORS[cat]}}>
                  {CAT_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        )
      }
    </div>
  );
}
