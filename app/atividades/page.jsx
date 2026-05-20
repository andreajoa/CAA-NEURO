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
    {id:"sim",label:"Sim",image:"/cards/level-1/sim.png",cat:"core"},
    {id:"nao",label:"Não",image:"/cards/level-1/nao.png",cat:"core"},
    {id:"ajuda",label:"Ajuda",image:"/cards/level-1/ajuda.png",cat:"core"},
    {id:"mais",label:"Mais",image:"/cards/level-1/mais.png",cat:"core"},
    {id:"agua",label:"Água",image:"/cards/level-1/agua.png",cat:"necessidades"},
    {id:"comer",label:"Comer",image:"/cards/level-1/comer.png",cat:"necessidades"},
    {id:"banheiro",label:"Banheiro",image:"/cards/level-1/banheiro.png",cat:"necessidades"},
    {id:"dormir",label:"Dormir",image:"/cards/level-1/dormir.png",cat:"necessidades"},
    {id:"feliz",label:"Feliz",image:"/cards/level-1/feliz.png",cat:"emocoes"},
    {id:"triste",label:"Triste",image:"/cards/level-1/triste.png",cat:"emocoes"},
    {id:"medo",label:"Medo",image:"/cards/level-1/medo.png",cat:"emocoes"},
    {id:"bravo",label:"Bravo",image:"/cards/level-1/bravo.png",cat:"emocoes"},
    {id:"brincar",label:"Brincar",image:"/cards/level-1/brincar.png",cat:"acoes"},
    {id:"parar",label:"Parar",image:"/cards/level-1/parar.png",cat:"acoes"},
    {id:"esperar",label:"Esperar",image:"/cards/level-1/esperar.png",cat:"acoes"},
    {id:"dor",label:"Dor",image:"/cards/level-1/dor.png",cat:"saude"},
    {id:"remedio",label:"Remédio",image:"/cards/level-1/remedio.png",cat:"saude"},
    {id:"escola",label:"Escola",image:"/cards/level-1/escola.png",cat:"lugares"},
  ];

  useEffect(() => {
    fetch("/api/cards?profile=infantil&level=emergente")
      .then(r => r.json())
      .then(d => {
        const raw = (d.cards || []).filter(c => c.image || c.image_url || c.label);
        const mapped = raw.map(c => ({
          ...c,
          image: c.image || c.image_url || `/cards/level-1/${c.id}.png`,
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
      <h2 style={{color:"#071b2c"}}>Adicione pelo menos 4 cards na prancha para usar as atividades.</h2>
      <Link href="/app" style={{background:"#00885f",color:"white",padding:"12px 24px",borderRadius:"10px",textDecoration:"none",fontWeight:"700"}}>← Ir para a Prancha</Link>
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
      <nav style={{background:"#071b2c",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #00885f"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
        <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
        <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👥 Pacientes</a>
        <a href="/biblioteca" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📚 Biblioteca</a>
        <a href="/atividades" style={{color:"white",textDecoration:"none",background:"rgba(78,201,160,0.3)",border:"1px solid #4ec9a0",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🎯 Atividades</a>
        <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px",marginLeft:"auto"}}>❓ Ajuda</a>
      </nav>
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"40px 24px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <h1 style={{fontSize:"28px",fontWeight:"800",color:"#071b2c",margin:"0 0 8px"}}>🎯 Atividades Terapêuticas</h1>
          <p style={{color:"#6b7280",fontSize:"16px"}}>{total} cards disponíveis · Escolha uma atividade para começar</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
          {modos.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"16px",padding:"24px",textAlign:"left",cursor:"pointer",transition:"all 0.2s",display:"flex",gap:"16px",alignItems:"flex-start"}}>
              <div style={{fontSize:"36px",lineHeight:1}}>{m.emoji}</div>
              <div>
                <div style={{fontWeight:"800",fontSize:"16px",color:"#071b2c",marginBottom:"4px"}}>{m.title}</div>
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
    <div style={{background:"#071b2c",color:"white",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
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
      <h2 style={{fontSize:"28px",fontWeight:"800",color:"#071b2c",margin:"0 0 8px"}}>
        {pct===100?"Perfeito!":pct>=70?"Muito bem!":"Continue praticando!"}
      </h2>
      <p style={{color:"#6b7280",fontSize:"16px",margin:"0 0 32px"}}>{score} de {total} corretos · {pct}%</p>
      <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
        <button onClick={onRestart} style={{background:"#00885f",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",fontWeight:"700",cursor:"pointer",fontSize:"15px"}}>🔄 Tentar novamente</button>
        <button onClick={onBack} style={{background:"white",color:"#374151",border:"1px solid #e5e7eb",padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontSize:"15px"}}>← Outras atividades</button>
      </div>
    </div>
  );
}

function Associacao({ cards, onBack }) {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    const pool = shuffle((cards || []).filter(c => c && c.image && c.label)).slice(0, 8);
    setItems(pool);
    setOptions(shuffle([...pool]));
  }, []);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState(null);

  function restart() { setAnswers({}); setScore(0); setDone(false); setSelected(null); }

  function pick(card) {
    if (!selected) { setSelected(card); return; }
    const match = items.find(i => i.id === selected.id);
    const correct = match?.label === card.label || selected.id === card.id;
    const newAns = { ...answers, [selected.id]: correct ? "correct" : "wrong" };
    setAnswers(newAns);
    if (correct) setScore(s => s + 1);
    setSelected(null);
    if (Object.keys(newAns).length === items.length) setDone(true);
  }

  if (done) return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🔗 Associação" score={score} total={items.length} onBack={onBack} onRestart={restart} />
      <Congratulations score={score} total={items.length} onRestart={restart} onBack={onBack} />
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="🔗 Associação" score={score} total={items.length} onBack={onBack} onRestart={restart} />
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"32px"}}>
        <div>
          <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px",fontSize:"14px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Imagens</p>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {(items || []).filter(Boolean).map(card => (
              <button key={card.id} onClick={() => setSelected(selected?.id===card.id ? null : card)}
                disabled={!!answers[card.id]}
                style={{background: answers[card.id]==="correct"?"#f0fdf4":answers[card.id]==="wrong"?"#fef2f2":selected?.id===card.id?"#eff6ff":"white",
                  border:`2px solid ${answers[card.id]==="correct"?"#16a34a":answers[card.id]==="wrong"?"#dc2626":selected?.id===card.id?"#2563eb":"#e5e7eb"}`,
                  borderRadius:"12px",padding:"12px",display:"flex",alignItems:"center",gap:"12px",cursor:answers[card.id]?"default":"pointer",textAlign:"left"}}>
                <img src={card.image} alt={card.label} style={{width:"48px",height:"48px",objectFit:"contain",borderRadius:"8px",flexShrink:0}} />
                <span style={{fontSize:"24px"}}>{answers[card.id]==="correct"?"✅":answers[card.id]==="wrong"?"❌":selected?.id===card.id?"👆":""}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{fontWeight:"700",color:"#374151",marginBottom:"12px",fontSize:"14px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Palavras</p>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {(options || []).filter(Boolean).map(card => (
              <button key={card.id} onClick={() => selected && pick(card)}
                style={{background:selected?"#eff6ff":"white",border:"2px solid #e5e7eb",borderRadius:"12px",padding:"14px 16px",cursor:selected?"pointer":"default",fontWeight:"700",fontSize:"15px",color:"#071b2c",textAlign:"left"}}>
                {card.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {!selected && <p style={{textAlign:"center",color:"#9ca3af",fontSize:"14px"}}>Toque em uma imagem para começar</p>}
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
                      background:matched.includes(card.uid)?"#f0fdf4":isFlipped?"white":"#071b2c",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",padding:"8px"}}>
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
  const pool = shuffle(cards.filter(c => c && c.image && c.label)).slice(0, 5);
  const [correct] = useState(pool);
  const [current, setCurrent] = useState(() => shuffle(pool));
  const [selected, setSelected] = useState([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  function pick(card) {
    if (selected.find(s => s.id === card.id)) return;
    const next = [...selected, card];
    setSelected(next);
    if (next.length === correct.length) {
      const correct2 = next.every((c, i) => c.id === correct[i].id);
      setScore(correct2 ? correct.length : Math.floor(correct.length / 2));
      setDone(true);
    }
  }

  function restart() { setCurrent(shuffle(pool)); setSelected([]); setDone(false); setScore(0); }

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <GameHeader title="📖 Sequência" score={score} total={correct.length} onBack={onBack} onRestart={restart} />
      {done
        ? <Congratulations score={score} total={correct.length} onRestart={restart} onBack={onBack} />
        : <div style={{maxWidth:"600px",margin:"24px auto",padding:"0 24px"}}>
            <p style={{textAlign:"center",color:"#6b7280",marginBottom:"24px"}}>Toque nos cards na ordem correta da história</p>
            <div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"24px",flexWrap:"wrap"}}>
              {selected.map((c, i) => (
                <div key={c.id} style={{background:"white",border:"2px solid #00885f",borderRadius:"10px",padding:"8px",textAlign:"center",minWidth:"80px"}}>
                  <div style={{fontSize:"12px",color:"#00885f",fontWeight:"700",marginBottom:"4px"}}>{i+1}</div>
                  {c.image && <img src={c.image} alt={c.label} style={{width:"48px",height:"48px",objectFit:"contain"}} />}
                  <div style={{fontSize:"11px",color:"#374151",fontWeight:"600",marginTop:"4px"}}>{c.label}</div>
                </div>
              ))}
              {Array(correct.length - selected.length).fill(0).map((_,i) => (
                <div key={i} style={{background:"#f9fafb",border:"2px dashed #e5e7eb",borderRadius:"10px",padding:"8px",minWidth:"80px",height:"96px"}} />
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:"12px"}}>
              {current.map(card => {
                const used = selected.find(s => s.id === card.id);
                return (
                  <button key={card.id} onClick={() => !used && pick(card)} disabled={!!used}
                    style={{background:used?"#f9fafb":"white",border:`2px solid ${used?"#e5e7eb":"#e5e7eb"}`,borderRadius:"12px",padding:"12px 8px",cursor:used?"default":"pointer",opacity:used?0.4:1,textAlign:"center"}}>
                    {card.image && <img src={card.image} alt={card.label} style={{width:"56px",height:"56px",objectFit:"contain"}} />}
                    <div style={{fontSize:"12px",fontWeight:"700",color:"#071b2c",marginTop:"6px"}}>{card.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
      }
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
              <div style={{fontSize:"13px",fontWeight:"700",color:"#00885f",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Pergunta {idx+1} de {FRASES.length}
              </div>
              <div style={{fontSize:"26px",fontWeight:"800",color:"#071b2c",marginBottom:"8px"}}>{frase.template}</div>
              <div style={{fontSize:"13px",color:"#9ca3af"}}>Escolha um card de: {frase.hint}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              {(options || []).filter(Boolean).map(card => (
                <button key={card.id} onClick={() => pick(card)}
                  style={{background:feedback&&card.cat===frase.cat?"#f0fdf4":feedback&&card.cat!==frase.cat?"#fef2f2":"white",
                    border:`2px solid ${feedback&&card.cat===frase.cat?"#16a34a":feedback&&card.cat!==frase.cat?"#dc2626":"#e5e7eb"}`,
                    borderRadius:"14px",padding:"16px",cursor:"pointer",textAlign:"center"}}>
                  {card.image && <img src={card.image} alt={card.label} style={{width:"64px",height:"64px",objectFit:"contain",marginBottom:"8px"}} />}
                  <div style={{fontWeight:"700",fontSize:"14px",color:"#071b2c"}}>{card.label}</div>
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
              <div style={{fontSize:"22px",fontWeight:"800",color:"#071b2c"}}>{current.label}</div>
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
