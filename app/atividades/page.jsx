"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Atividades() {
  const [cards, setCards] = useState([]);
  const [mode, setMode] = useState(null); // "associacao" | "pareamento" | "sequencia"
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/cards").then(r => r.json()).then(d => {
      setCards((d.cards || []).filter(c => c.image));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui"}}><p>Carregando...</p></div>;

  if (cards.length < 4) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui",flexDirection:"column",gap:"16px"}}>
      <div style={{fontSize:"48px"}}>📚</div>
      <h2 style={{color:"#071b2c"}}>Adicione pelo menos 4 cards com imagem na prancha para usar as atividades.</h2>
      <button onClick={() => router.push("/app")} style={{background:"#00885f",color:"white",border:"none",padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"700"}}>← Ir para a Prancha</button>
    </div>
  );

  if (!mode) return <Menu setMode={setMode} router={router} />;
  if (mode === "associacao") return <Associacao cards={cards} onBack={() => setMode(null)} />;
  if (mode === "pareamento") return <Pareamento cards={cards} onBack={() => setMode(null)} />;
  if (mode === "sequencia") return <Sequencia cards={cards} onBack={() => setMode(null)} />;
}

function Menu({ setMode, router }) {
  const modos = [
    { id:"associacao", emoji:"🔗", title:"Associação", desc:"Conecte a palavra à imagem correta" },
    { id:"pareamento", emoji:"🃏", title:"Pareamento", desc:"Encontre os pares iguais" },
    { id:"sequencia",  emoji:"📖", title:"Sequência",  desc:"Ordene os cards para contar uma história" },
  ];
  return (
    <div style={{minHeight:"100vh",background:"#f0fdf7",fontFamily:"system-ui"}}>
      <div style={{background:"#071b2c",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"20px"}}>CAA Neuro</span>
        <button onClick={() => router.push("/app")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Prancha</button>
      </div>
      <div style={{maxWidth:"700px",margin:"0 auto",padding:"40px 24px"}}>
        <h1 style={{fontSize:"28px",fontWeight:"800",color:"#071b2c",marginBottom:"8px"}}>🎮 Atividades Adaptadas</h1>
        <p style={{color:"#6b7280",marginBottom:"32px"}}>Escolha uma atividade para praticar com o paciente usando os cards da sua prancha.</p>
        <div style={{display:"grid",gap:"16px"}}>
          {modos.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{background:"white",border:"2px solid #e5e7eb",borderRadius:"16px",padding:"24px",cursor:"pointer",display:"flex",alignItems:"center",gap:"20px",textAlign:"left",transition:"all 0.15s"}}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#00885f"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.transform="translateY(0)"; }}>
              <span style={{fontSize:"40px"}}>{m.emoji}</span>
              <div>
                <div style={{fontSize:"20px",fontWeight:"800",color:"#071b2c"}}>{m.title}</div>
                <div style={{fontSize:"14px",color:"#6b7280",marginTop:"4px"}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Associacao({ cards, onBack }) {
  const pool = shuffle(cards).slice(0, 6);
  const [target] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [options] = useState(() => shuffle(pool).slice(0, 4).map(c => c.label).includes(target.label)
    ? shuffle(pool.slice(0,4)) : shuffle([target, ...shuffle(pool.filter(c=>c.id!==target.id)).slice(0,3)]));

  function choose(card) {
    if (result) return;
    setSelected(card.id);
    if (card.id === target.id) { setResult("✅ Correto!"); setScore(s => s+1); }
    else setResult("❌ Tente novamente");
  }

  return (
    <div style={{minHeight:"100vh",background:"#f0fdf7",fontFamily:"system-ui"}}>
      <div style={{background:"#071b2c",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"18px"}}>🔗 Associação</span>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <span style={{color:"white",fontSize:"14px"}}>✅ {score} pontos</span>
          <button onClick={onBack} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
        </div>
      </div>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"32px 24px",textAlign:"center"}}>
        <p style={{color:"#6b7280",marginBottom:"8px",fontSize:"14px"}}>Qual imagem corresponde à palavra?</p>
        <h2 style={{fontSize:"36px",fontWeight:"900",color:"#071b2c",marginBottom:"32px",background:"#00885f",color:"white",padding:"16px 32px",borderRadius:"16px",display:"inline-block"}}>{target.label}</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          {options.map(card => (
            <button key={card.id} onClick={() => choose(card)}
              style={{background:"white",border:`3px solid ${selected===card.id ? (card.id===target.id?"#00885f":"#ef4444") : "#e5e7eb"}`,
                borderRadius:"16px",padding:"20px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px"}}>
              <img src={card.image} alt={card.label} style={{width:"80px",height:"80px",objectFit:"contain"}} />
              <span style={{fontSize:"13px",fontWeight:"700",color:"#374151"}}>{card.label}</span>
            </button>
          ))}
        </div>
        {result && (
          <div style={{marginTop:"24px",fontSize:"20px",fontWeight:"800",color: result.includes("✅")?"#00885f":"#ef4444"}}>
            {result}
            <button onClick={onBack} style={{display:"block",margin:"16px auto 0",background:"#00885f",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"700",fontSize:"15px"}}>
              Nova rodada
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pareamento({ cards, onBack }) {
  const pool = shuffle(cards).slice(0, 4);
  const [items] = useState(() => shuffle([...pool.map(c=>({...c,key:c.id+"-a"})), ...pool.map(c=>({...c,key:c.id+"-b"}))]));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);

  function flip(item) {
    if (flipped.length === 2 || flipped.find(f=>f.key===item.key) || matched.includes(item.id)) return;
    const next = [...flipped, item];
    setFlipped(next);
    if (next.length === 2) {
      if (next[0].id === next[1].id) {
        setMatched(m => [...m, next[0].id]);
        setScore(s => s+1);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  const done = matched.length === pool.length;

  return (
    <div style={{minHeight:"100vh",background:"#f0fdf7",fontFamily:"system-ui"}}>
      <div style={{background:"#071b2c",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"18px"}}>🃏 Pareamento</span>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          <span style={{color:"white",fontSize:"14px"}}>✅ {score}/{pool.length} pares</span>
          <button onClick={onBack} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
        </div>
      </div>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"32px 24px",textAlign:"center"}}>
        <p style={{color:"#6b7280",marginBottom:"24px"}}>Encontre os pares iguais!</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px"}}>
          {items.map(item => {
            const isFlipped = flipped.find(f=>f.key===item.key) || matched.includes(item.id);
            return (
              <button key={item.key} onClick={() => flip(item)}
                style={{background: isFlipped ? "white" : "#071b2c",border:`2px solid ${matched.includes(item.id)?"#00885f":"#e5e7eb"}`,
                  borderRadius:"12px",padding:"12px",cursor:"pointer",aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"6px",transition:"all 0.2s"}}>
                {isFlipped ? <>
                  <img src={item.image} alt={item.label} style={{width:"50px",height:"50px",objectFit:"contain"}} />
                  <span style={{fontSize:"11px",fontWeight:"700",color:"#374151"}}>{item.label}</span>
                </> : <span style={{fontSize:"24px",color:"#4ec9a0"}}>?</span>}
              </button>
            );
          })}
        </div>
        {done && (
          <div style={{marginTop:"24px",fontSize:"22px",fontWeight:"800",color:"#00885f"}}>
            🎉 Parabéns! Todos os pares encontrados!
            <button onClick={onBack} style={{display:"block",margin:"16px auto 0",background:"#00885f",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"700",fontSize:"15px"}}>
              Nova atividade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Sequencia({ cards, onBack }) {
  const pool = shuffle(cards).slice(0, 5);
  const [answer] = useState(() => shuffle(pool));
  const [correct] = useState(() => [...pool]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  function pick(card) {
    if (selected.find(s=>s.id===card.id) || result) return;
    const next = [...selected, card];
    setSelected(next);
    if (next.length === answer.length) {
      const ok = next.every((c,i) => c.id === correct[i].id);
      setResult(ok ? "✅ Sequência correta!" : "❌ Tente uma ordem diferente!");
    }
  }

  return (
    <div style={{minHeight:"100vh",background:"#f0fdf7",fontFamily:"system-ui"}}>
      <div style={{background:"#071b2c",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"18px"}}>📖 Sequência</span>
        <button onClick={onBack} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
      </div>
      <div style={{maxWidth:"700px",margin:"0 auto",padding:"32px 24px"}}>
        <p style={{color:"#6b7280",marginBottom:"8px",fontSize:"14px",textAlign:"center"}}>Toque nos cards na ordem certa para contar a história</p>
        <div style={{background:"white",borderRadius:"16px",border:"2px solid #e5e7eb",padding:"16px",minHeight:"100px",marginBottom:"24px",display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"center"}}>
          {selected.length === 0 && <span style={{color:"#9ca3af",fontSize:"14px"}}>Sua sequência aparece aqui...</span>}
          {selected.map((c,i) => (
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
              <img src={c.image} alt={c.label} style={{width:"56px",height:"56px",objectFit:"contain"}} />
              <span style={{fontSize:"11px",fontWeight:"700",color:"#374151"}}>{c.label}</span>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:"12px"}}>
          {answer.map(card => {
            const used = selected.find(s=>s.id===card.id);
            return (
              <button key={card.id} onClick={() => pick(card)}
                style={{background: used?"#f3f4f6":"white",border:`2px solid ${used?"#d1d5db":"#e5e7eb"}`,opacity:used?0.4:1,
                  borderRadius:"12px",padding:"14px",cursor:used?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
                <img src={card.image} alt={card.label} style={{width:"56px",height:"56px",objectFit:"contain"}} />
                <span style={{fontSize:"12px",fontWeight:"700",color:"#374151",textAlign:"center"}}>{card.label}</span>
              </button>
            );
          })}
        </div>
        {result && (
          <div style={{marginTop:"24px",textAlign:"center",fontSize:"20px",fontWeight:"800",color:result.includes("✅")?"#00885f":"#ef4444"}}>
            {result}
            <button onClick={() => { setSelected([]); setResult(null); }} style={{display:"block",margin:"16px auto 0",background:"#00885f",color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"700",fontSize:"15px"}}>
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
