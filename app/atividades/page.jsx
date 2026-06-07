"use client";
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

  useEffect(() => {
    fetch("/api/cards?profile=infantil&level=emergente")
      .then(r => r.json())
      .then(d => {
        const raw = (d.cards || []).filter(c => c.image || c.image_url || c.label);
        const mapped = raw.map(c => ({
          ...c,
          image: c.image || c.image_url || `/cards/level-1/${c.id}.webp?v=20260521-optimized`,
          cat: c.cat || c.category || "core",
        }));
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
  // ARQUITETURA SIMPLES E INFALIVEL:
  // - items: array fixo de cards (imagens, lado esquerdo, ordem fixa)
  // - words: array de palavras embaralhadas (lado direito, lista independente)
  // - matched: Set de ids ja acertados
  // - selectedImg: id da imagem selecionada no momento
  // Regra unica: clica imagem -> clica palavra -> se ids iguais = acerto

  const [items,       setItems]       = useState([]); // cards com imagem+label, deduplicados
  const [words,       setWords]       = useState([]); // [{id,label}] embaralhados
  const [matched,     setMatched]     = useState(new Set()); // ids acertados
  const [selectedImg, setSelectedImg] = useState(null); // id da imagem selecionada
  const [wrongWord,   setWrongWord]   = useState(null); // id da palavra com flash erro
  const [score,       setScore]       = useState(0);
  const [done,        setDone]        = useState(false);

  function init() {
    // 1. Deduplica por id
    const seen = new Set();
    const unique = [];
    for (const c of (cards || [])) {
      if (c && c.image && c.label && c.id && !seen.has(String(c.id))) {
        seen.add(String(c.id));
        unique.push({ ...c, id: String(c.id) });
      }
    }
    // 2. Pega ate 6 cards aleatorios
    const pool = shuffle(unique).slice(0, 6);
    // 3. Imagens em ordem fixa, palavras embaralhadas separadamente
    const shuffledWords = shuffle(pool.map(c => ({ id: c.id, label: c.label })));
    setItems(pool);
    setWords(shuffledWords);
    setMatched(new Set());
    setSelectedImg(null);
    setWrongWord(null);
    setScore(0);
    setDone(false);
  }

  useEffect(() => { init(); }, []);

  function handleImageClick(imgId) {
    if (matched.has(imgId)) return; // ja acertou, ignora
    setSelectedImg(prev => prev === imgId ? null : imgId);
    setWrongWord(null);
  }

  function handleWordClick(wordId) {
    if (!selectedImg) return;           // nenhuma imagem selecionada
    if (matched.has(wordId)) return;    // palavra ja usada

    if (selectedImg === wordId) {
      // ✅ ACERTO — ids batem
      const newMatched = new Set(matched);
      newMatched.add(wordId);
      setMatched(newMatched);
      setScore(s => s + 1);
      setSelectedImg(null);
      setWrongWord(null);
      if (newMatched.size === items.length) {
        setTimeout(() => setDone(true), 400);
      }
    } else {
      // ❌ ERRO — flash vermelho na palavra, imagem continua selecionada
      setWrongWord(wordId);
      setTimeout(() => setWrongWord(null), 700);
    }
  }

  const selectedLabel = selectedImg ? (items.find(c => c.id === selectedImg)?.label ?? "") : "";

  if (done) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🔗 Associação" score={score} total={items.length} onBack={onBack} onRestart={init} />
      <Congratulations score={score} total={items.length} onRestart={init} onBack={onBack} />
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui",paddingBottom:"40px"}}>
      <GameHeader title="🔗 Associação" score={score} total={items.length} onBack={onBack} onRestart={init} />

      {/* Instrucao */}
      <p style={{
        textAlign:"center", margin:"14px 0 10px",
        fontSize:"14px", fontWeight: selectedImg ? "700" : "400",
        color: selectedImg ? "#C76B4A" : "#9ca3af",
        transition:"color 0.2s, font-weight 0.2s"
      }}>
        {selectedImg
          ? `👆 Toque na palavra correta para "${selectedLabel}"`
          : "Toque em uma imagem para selecionar"}
      </p>

      <div style={{maxWidth:"660px",margin:"0 auto",padding:"0 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",alignItems:"start"}}>

        {/* COLUNA ESQUERDA — IMAGENS (ordem fixa) */}
        <div>
          <p style={{fontWeight:"700",color:"#374151",fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px",textAlign:"center"}}>
            🖼️ Imagem
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {items.map(card => {
              const isMatched = matched.has(card.id);
              const isSel     = selectedImg === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleImageClick(card.id)}
                  disabled={isMatched}
                  style={{
                    background: isMatched ? "#f0fdf4" : isSel ? "#FFF5F2" : "white",
                    border: `2px solid ${isMatched ? "#16a34a" : isSel ? "#C76B4A" : "#e5e7eb"}`,
                    borderRadius:"12px",
                    padding:"10px 12px",
                    display:"flex",
                    alignItems:"center",
                    gap:"10px",
                    cursor: isMatched ? "default" : "pointer",
                    transition:"all 0.2s",
                    minHeight:"70px",
                    boxShadow: isSel ? "0 0 0 3px rgba(199,107,74,0.2)" : "none"
                  }}>
                  <img
                    src={card.image}
                    alt={card.label}
                    style={{width:"46px",height:"46px",objectFit:"contain",borderRadius:"8px",flexShrink:0}}
                    onError={e => { e.target.style.display="none"; }}
                  />
                  <span style={{fontSize:"20px"}}>
                    {isMatched ? "✅" : isSel ? "👆" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA — PALAVRAS (embaralhadas, lista independente) */}
        <div>
          <p style={{fontWeight:"700",color:"#374151",fontSize:"12px",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px",textAlign:"center"}}>
            🔤 Palavra
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {words.map(word => {
              const isMatched = matched.has(word.id);
              const isWrong   = wrongWord === word.id;
              const isActive  = !!selectedImg && !isMatched;
              return (
                <button
                  key={word.id}
                  onClick={() => handleWordClick(word.id)}
                  disabled={isMatched}
                  style={{
                    background: isMatched ? "#f0fdf4" : isWrong ? "#fef2f2" : isActive ? "#FFF5F2" : "white",
                    border: `2px solid ${isMatched ? "#16a34a" : isWrong ? "#dc2626" : isActive ? "#C76B4A" : "#e5e7eb"}`,
                    borderRadius:"12px",
                    padding:"10px 14px",
                    cursor: isMatched ? "default" : isActive ? "pointer" : "default",
                    fontWeight:"700",
                    fontSize:"15px",
                    color: isMatched ? "#16a34a" : isWrong ? "#dc2626" : "#1B2D5B",
                    textAlign:"center",
                    transition:"all 0.15s",
                    minHeight:"70px",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:"6px",
                    opacity: 1
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
  // Pool fixo embaralhado — a "ordem correta" e definida antes do jogo comecar
  const [pool]    = useState(() => shuffle(cards.filter(c => c && c.image && c.label)).slice(0, 5));
  const [correct] = useState(() => {
    // Ordem correta = pool ordenado alfabeticamente pelo label (deterministico e ensinavel)
    return [...pool].sort((a, b) => a.label.localeCompare(b.label, "pt"));
  });
  const [bank,    setBank]    = useState(() => shuffle([...pool]));
  const [sequence,setSequence]= useState([]);
  const [phase,   setPhase]   = useState("intro"); // intro | playing | result
  const [score,   setScore]   = useState(0);
  const [wrongIdx,setWrongIdx]= useState(null);

  function startGame() { setPhase("playing"); }

  function addCard(card) {
    if (sequence.find(s => s.id === card.id)) return;
    const next = [...sequence, card];
    setSequence(next);
    setBank(prev => prev.filter(c => c.id !== card.id));
    if (next.length === correct.length) {
      const hits = next.filter((c, i) => c.id === correct[i].id).length;
      setScore(hits);
      setPhase("result");
    }
  }

  function removeCard(idx) {
    const card = sequence[idx];
    setSequence(prev => prev.filter((_, i) => i !== idx));
    setBank(prev => shuffle([...prev, card]));
  }

  function restart() {
    setBank(shuffle([...pool]));
    setSequence([]);
    setScore(0);
    setPhase("playing");
    setWrongIdx(null);
  }

  // --- TELA INTRO ---
  if (phase === "intro") return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
        <div style={{fontWeight:"700",fontSize:"16px"}}>📖 Sequência</div>
      </div>
      <div style={{maxWidth:"520px",margin:"60px auto",padding:"0 24px",textAlign:"center"}}>
        <div style={{fontSize:"64px",marginBottom:"16px"}}>📖</div>
        <h2 style={{fontSize:"24px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 16px"}}>Como funciona?</h2>
        <div style={{background:"white",borderRadius:"16px",padding:"28px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",textAlign:"left",marginBottom:"28px"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
              <div style={{background:"#C76B4A",color:"white",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",flexShrink:0}}>1</div>
              <div>
                <div style={{fontWeight:"700",color:"#1B2D5B",marginBottom:"4px"}}>Veja os cards disponíveis</div>
                <div style={{color:"#6b7280",fontSize:"14px"}}>Os cards aparecem embaralhados na parte de baixo da tela.</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
              <div style={{background:"#C76B4A",color:"white",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",flexShrink:0}}>2</div>
              <div>
                <div style={{fontWeight:"700",color:"#1B2D5B",marginBottom:"4px"}}>Toque para colocar na sequência</div>
                <div style={{color:"#6b7280",fontSize:"14px"}}>Toque num card para adicioná-lo à sua sequência, na ordem que achar correta.</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
              <div style={{background:"#C76B4A",color:"white",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",flexShrink:0}}>3</div>
              <div>
                <div style={{fontWeight:"700",color:"#1B2D5B",marginBottom:"4px"}}>Pode remover e trocar</div>
                <div style={{color:"#6b7280",fontSize:"14px"}}>Toque em ✕ num card da sequência para removê-lo e tentar outra posição.</div>
              </div>
            </div>
            <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
              <div style={{background:"#C76B4A",color:"white",borderRadius:"50%",width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",flexShrink:0}}>4</div>
              <div>
                <div style={{fontWeight:"700",color:"#1B2D5B",marginBottom:"4px"}}>Complete todos os espaços</div>
                <div style={{color:"#6b7280",fontSize:"14px"}}>Quando todos os cards estiverem na sequência, o resultado aparece automaticamente.</div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={startGame}
          style={{background:"#C76B4A",color:"white",border:"none",padding:"14px 40px",borderRadius:"12px",fontWeight:"800",fontSize:"16px",cursor:"pointer",boxShadow:"0 4px 14px rgba(199,107,74,0.35)"}}>
          Começar 🚀
        </button>
      </div>
    </div>
  );

  // --- TELA RESULTADO ---
  if (phase === "result") {
    const pct = Math.round((score / correct.length) * 100);
    return (
      <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
        <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",gap:"12px"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
          <div style={{fontWeight:"700",fontSize:"16px"}}>📖 Sequência</div>
        </div>
        <div style={{maxWidth:"600px",margin:"40px auto",padding:"0 24px",textAlign:"center"}}>
          <div style={{fontSize:"56px",marginBottom:"12px"}}>{pct===100?"🏆":pct>=60?"⭐":"💪"}</div>
          <h2 style={{fontSize:"24px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 6px"}}>
            {pct===100?"Perfeito!":pct>=60?"Muito bem!":"Continue praticando!"}
          </h2>
          <p style={{color:"#6b7280",margin:"0 0 28px"}}>{score} de {correct.length} na posição certa</p>

          <div style={{marginBottom:"28px"}}>
            <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Sua sequência</p>
            <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap"}}>
              {sequence.map((c, i) => {
                const ok = c.id === correct[i].id;
                return (
                  <div key={c.id} style={{background:ok?"#f0fdf4":"#fef2f2",border:`2px solid ${ok?"#16a34a":"#dc2626"}`,borderRadius:"10px",padding:"8px",textAlign:"center",minWidth:"80px"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:ok?"#16a34a":"#dc2626",marginBottom:"4px"}}>{ok?"✅":"❌"} Pos. {i+1}</div>
                    <img src={c.image} alt={c.label} style={{width:"44px",height:"44px",objectFit:"contain"}} />
                    <div style={{fontSize:"11px",color:"#374151",fontWeight:"600",marginTop:"4px"}}>{c.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {pct < 100 && (
            <div style={{marginBottom:"28px"}}>
              <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Ordem correta era</p>
              <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap"}}>
                {correct.map((c, i) => (
                  <div key={c.id} style={{background:"white",border:"2px solid #1B2D5B",borderRadius:"10px",padding:"8px",textAlign:"center",minWidth:"80px"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:"#1B2D5B",marginBottom:"4px"}}>{i+1}º</div>
                    <img src={c.image} alt={c.label} style={{width:"44px",height:"44px",objectFit:"contain"}} />
                    <div style={{fontSize:"11px",color:"#374151",fontWeight:"600",marginTop:"4px"}}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
            <button onClick={restart} style={{background:"#C76B4A",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontWeight:"700",cursor:"pointer",fontSize:"15px"}}>🔄 Tentar novamente</button>
            <button onClick={onBack} style={{background:"white",color:"#374151",border:"1px solid #e5e7eb",padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontSize:"15px"}}>← Outras atividades</button>
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DE JOGO ---
  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <div style={{background:"#1B2D5B",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
        <div style={{fontWeight:"700",fontSize:"16px"}}>📖 Sequência</div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <span style={{background:"rgba(255,255,255,0.1)",padding:"6px 14px",borderRadius:"20px",fontSize:"13px"}}>
            {sequence.length}/{correct.length} colocados
          </span>
          <button onClick={restart} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>🔄</button>
        </div>
      </div>

      <div style={{maxWidth:"700px",margin:"0 auto",padding:"24px"}}>

        {/* ZONA DA SEQUENCIA */}
        <div style={{marginBottom:"28px"}}>
          <p style={{fontWeight:"700",color:"#374151",marginBottom:"10px",fontSize:"13px",textTransform:"uppercase",letterSpacing:"0.05em",textAlign:"center"}}>
            Sua sequência — toque em ✕ para remover
          </p>
          <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",minHeight:"110px",background:"white",borderRadius:"16px",border:"2px dashed #e5e7eb",padding:"12px",alignItems:"center"}}>
            {sequence.length === 0 && (
              <p style={{color:"#9ca3af",fontSize:"14px",margin:0}}>Toque nos cards abaixo para montar a sequência</p>
            )}
            {sequence.map((c, i) => (
              <div key={c.id} style={{background:"#FFF5F2",border:"2px solid #C76B4A",borderRadius:"10px",padding:"8px",textAlign:"center",minWidth:"76px",position:"relative"}}>
                <button onClick={() => removeCard(i)}
                  style={{position:"absolute",top:"-8px",right:"-8px",background:"#dc2626",border:"none",color:"white",borderRadius:"50%",width:"20px",height:"20px",fontSize:"11px",cursor:"pointer",fontWeight:"800",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
                <div style={{fontSize:"11px",color:"#C76B4A",fontWeight:"700",marginBottom:"4px"}}>{i+1}º</div>
                <img src={c.image} alt={c.label} style={{width:"44px",height:"44px",objectFit:"contain"}} />
                <div style={{fontSize:"11px",color:"#1B2D5B",fontWeight:"600",marginTop:"4px"}}>{c.label}</div>
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
                Todos os cards foram colocados! Confira sua sequência acima.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletarFrase({ cards, onBack }) {
  const FRASES = [
    { template: "Eu quero ___", cat: "necessidades", hint: "necessidades" },
    { template: "Eu estou ___", cat: "emocoes", hint: "emoções" },
    { template: "Eu preciso de ___", cat: "core", hint: "core" },
    { template: "Vou ___", cat: "acoes", hint: "ações" },
    { template: "Estou com ___", cat: "saude", hint: "saúde" },
  ];

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [options, setOptions] = useState([]);

  const frase = FRASES[idx];

  // Recalcula opções toda vez que idx ou cards mudam
  useEffect(() => {
    if (!cards?.length) return;
    const catCards = cards.filter(c => c && c.cat === frase.cat);
    const wrongPool = cards.filter(c => c && c.cat !== frase.cat);
    const correct = shuffle(catCards)[0];
    if (!correct) return;
    const wrongs = shuffle(wrongPool).slice(0, 3);
    setOptions(shuffle([correct, ...wrongs]).slice(0, 4));
  }, [idx, cards]);

  function pick(card) {
    if (feedback || !card) return;
    // Correto se o cat do card bate com o cat da frase
    const isCorrect = card.cat === frase.cat;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= FRASES.length) setDone(true);
      else { setIdx(i => i + 1); setFeedback(null); }
    }, 1200);
  }

  function restart() { setIdx(0); setScore(0); setFeedback(null); setDone(false); }

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="💬 Completar Frase" score={score} total={FRASES.length} onBack={onBack} onRestart={restart} />
      {done
        ? <Congratulations score={score} total={FRASES.length} onRestart={restart} onBack={onBack} />
        : <div style={{maxWidth:"560px",margin:"40px auto",padding:"0 24px"}}>
            <div style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"20px",padding:"32px",textAlign:"center",marginBottom:"32px"}}>
              <div style={{fontSize:"13px",fontWeight:"700",color:"#C76B4A",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Pergunta {idx+1} de {FRASES.length}
              </div>
              <div style={{fontSize:"26px",fontWeight:"800",color:"#1B2D5B",marginBottom:"8px"}}>{frase.template}</div>
              <div style={{fontSize:"13px",color:"#9ca3af"}}>Escolha um card de: {frase.hint}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {(options || []).filter(Boolean).map(card => (
                <button key={card.id} onClick={() => pick(card)}
                  style={{background:feedback&&card.cat===frase.cat?"#f0fdf4":feedback&&card.cat!==frase.cat?"#fef2f2":"white",
                    border:`2px solid ${feedback&&card.cat===frase.cat?"#16a34a":feedback&&card.cat!==frase.cat?"#dc2626":"#e5e7eb"}`,
                    borderRadius:"14px",padding:"16px",cursor:"pointer",textAlign:"center"}}>
                  {card.image && <img src={card.image} alt={card.label} style={{width:"64px",height:"64px",objectFit:"contain",marginBottom:"8px"}} />}
                  <div style={{fontWeight:"700",fontSize:"14px",color:"#1B2D5B"}}>{card.label}</div>
                </button>
              ))}
            </div>
            {feedback && (
              <div style={{textAlign:"center",marginTop:"20px",fontSize:"24px"}}>{feedback==="correct"?"✅ Correto!":"❌ Tente de novo!"}</div>
            )}
          </div>
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

  const CAT_LABELS = { core:"⭐ Core", necessidades:"🍎 Necessidades", emocoes:"😊 Emoções", acoes:"🏃 Ações" };
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
