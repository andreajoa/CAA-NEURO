"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

const starterCards = [
  { id:"sim", label:"Sim", image:"/cards/level-1/sim.png", cat:"core" },
  { id:"nao", label:"Não", image:"/cards/level-1/nao.png", cat:"core" },
  { id:"me-da", label:"Me dá", image:"/cards/level-1/me-da.png", cat:"core" },
  { id:"agua", label:"Água", image:"/cards/level-1/agua.png", cat:"necessidades" },
  { id:"comer", label:"Comer", image:"/cards/level-1/comer.png", cat:"necessidades" },
  { id:"banheiro", label:"Banheiro", image:"/cards/level-1/banheiro.png", cat:"necessidades" },
  { id:"feliz", label:"Feliz", image:"/cards/level-1/feliz.png", cat:"emocoes" },
  { id:"triste", label:"Triste", image:"/cards/level-1/triste.png", cat:"emocoes" },
  { id:"ajuda", label:"Ajuda", image:"/cards/level-1/ajuda.png", cat:"core" },
];

const categories = [
  { id:"all", label:"Todos" },
  { id:"core", label:"Core" },
  { id:"necessidades", label:"Necessidades" },
  { id:"emocoes", label:"Emoções" },
  { id:"acoes", label:"Ações" },
  { id:"lugares", label:"Lugares" },
  { id:"saude", label:"Saúde" },
  { id:"social", label:"Social" },
  { id:"emergencia", label:"Emergência" },
];

export default function AppPage() {
  const [cards, setCards] = useState(starterCards);
  const [category, setCategory] = useState("all");
  const [phrase, setPhrase] = useState([]);
  const [editing, setEditing] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [sessions, setSessions] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    const savedCards = localStorage.getItem("caa-current-board");
    const savedSessions = localStorage.getItem("caa-sessions");
    if (savedCards) setCards(JSON.parse(savedCards));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  function saveCards(next) {
    setCards(next);
    localStorage.setItem("caa-current-board", JSON.stringify(next));
  }

  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function selectCard(card) {
    setPhrase((old) => [...old, card.label]);
    speak(card.label);
  }

  function addCard() {
    const card = { id: crypto.randomUUID(), label:"Novo card", image:"", cat:"core" };
    saveCards([...cards, card]);
    setEditing(card);
  }

  function saveEditing() {
    saveCards(cards.map((c) => c.id === editing.id ? editing : c));
    setEditing(null);
  }

  async function uploadImage(file) {
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => setEditing({ ...editing, image: reader.result });
    reader.readAsDataURL(file);
  }

  function saveSession() {
    const item = {
      id: crypto.randomUUID(),
      patientName: patientName || "Sem paciente",
      phrase: phrase.join(" "),
      createdAt: new Date().toLocaleString("pt-BR"),
    };
    const next = [item, ...sessions];
    setSessions(next);
    localStorage.setItem("caa-sessions", JSON.stringify(next));
  }

  const shownCards = category === "all" ? cards : cards.filter((c) => c.cat === category);

  return (
    <main className="toolPage">
      <header className="toolTop">
        <div>
          <Link href="/" className="backHome">← Página inicial</Link>
          <h1>CAA Neuro</h1>
          <p>Ferramenta profissional de comunicação aumentativa e alternativa.</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <section className="toolPanel">
        <div>
          <label>Paciente / usuário</label>
          <input value={patientName} onChange={(e)=>setPatientName(e.target.value)} placeholder="Nome do paciente" />
        </div>
        <div>
          <label>Frase atual</label>
          <div className="phraseBox">
            {phrase.length ? phrase.map((w,i)=><span key={i}>{w}</span>) : <em>Toque nos cards para montar uma frase.</em>}
          </div>
          <div className="toolActions">
            <button onClick={()=>speak(phrase.join(" "))}>Falar frase</button>
            <button onClick={()=>setPhrase([])}>Limpar</button>
            <button onClick={saveSession}>Salvar sessão</button>
            <button onClick={addCard}>+ Novo card</button>
          </div>
        </div>
      </section>

      <section className="categoryBar">
        {categories.map((cat)=>(
          <button key={cat.id} className={category===cat.id ? "active" : ""} onClick={()=>setCategory(cat.id)}>
            {cat.label}
          </button>
        ))}
      </section>

      <section className="toolLayout">
        <div className="toolGrid">
          {shownCards.map((card)=>(
            <article className={`toolCard cat-${card.cat}`} key={card.id}>
              <button onClick={()=>selectCard(card)} className="toolCardMain">
                <div className="toolImg">
                  {card.image ? <img src={card.image} alt={card.label} /> : <div className="emptyCard">+</div>}
                </div>
                <strong>{card.label}</strong>
              </button>
              <button className="editSmall" onClick={()=>setEditing(card)}>Editar</button>
            </article>
          ))}
        </div>

        <aside className="toolEditor">
          <h2>Editar card</h2>
          {editing ? (
            <>
              <div className="editorPreview">
                {editing.image ? <img src={editing.image} alt={editing.label} /> : <div className="emptyCard">+</div>}
              </div>

              <label>Nome</label>
              <input value={editing.label} onChange={(e)=>setEditing({...editing,label:e.target.value})} />

              <label>Categoria</label>
              <select value={editing.cat} onChange={(e)=>setEditing({...editing,cat:e.target.value})}>
                {categories.filter(c=>c.id!=="all").map((cat)=><option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>

              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e)=>uploadImage(e.target.files?.[0])} />
              <button onClick={()=>fileRef.current?.click()}>Trocar imagem</button>
              <button className="saveBtn" onClick={saveEditing}>Salvar alterações</button>
              <button onClick={()=>setEditing(null)}>Cancelar</button>
            </>
          ) : <p>Selecione um card para editar.</p>}
        </aside>
      </section>

      <section className="sessionHistory">
        <h2>Histórico de sessões</h2>
        {!sessions.length && <p>Nenhuma sessão salva ainda.</p>}
        {sessions.map((s)=>(
          <article key={s.id}>
            <b>{s.patientName}</b>
            <span>{s.createdAt}</span>
            <p>{s.phrase}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
