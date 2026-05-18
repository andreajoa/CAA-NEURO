"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";

const img = (name) => `/cards/level-1/${name}.png`;

const profiles = [
  { id: "infantil", label: "Infantil", icon: "👶" },
  { id: "adulto", label: "Adulto", icon: "🧑" },
  { id: "idoso", label: "Idoso", icon: "👴" },
  { id: "escolar", label: "Escolar", icon: "🏫" },
  { id: "clinico", label: "Clínico", icon: "🩺" },
  { id: "personalizado", label: "Personalizado", icon: "⭐" },
];

const levels = [
  { id: "emergente", label: "Emergente" },
  { id: "inicial", label: "Inicial" },
  { id: "frases", label: "Frases funcionais" },
  { id: "conversacao", label: "Conversação" },
];

const categories = [
  { id: "core", label: "Core / essenciais" },
  { id: "necessidades", label: "Necessidades" },
  { id: "emocoes", label: "Emoções" },
  { id: "acoes", label: "Ações" },
  { id: "lugares", label: "Lugares" },
  { id: "saude", label: "Saúde" },
  { id: "social", label: "Social" },
  { id: "emergencia", label: "Emergência" },
];

const infantilEmergente = [
  ["sim","Sim",img("sim"),"core"],["nao","Não",img("nao"),"core"],["me-da","Me dá",img("me-da"),"core"],
  ["nao-quero","Não quero",img("nao-quero"),"core"],["mais","Mais",img("mais"),"core"],["acabou","Acabou",img("acabou"),"core"],
  ["ajuda","Ajuda",img("ajuda"),"core"],["esperar","Esperar",img("esperar"),"acoes"],["agua","Água",img("agua"),"necessidades"],
  ["comer","Comer",img("comer"),"necessidades"],["banheiro","Banheiro",img("banheiro"),"necessidades"],["dor","Dor",img("dor"),"saude"],
  ["dormir","Dormir",img("dormir"),"necessidades"],["tomar-banho","Tomar banho",img("tomar-banho"),"acoes"],["remedio","Remédio",img("remedio"),"saude"],
  ["feliz","Feliz",img("feliz"),"emocoes"],["triste","Triste",img("triste"),"emocoes"],["bravo","Bravo",img("bravo"),"emocoes"],
  ["medo","Medo",img("medo"),"emocoes"],["cansado","Cansado",img("cansado"),"emocoes"],["brincar","Brincar",img("brincar"),"acoes"],
  ["parar","Parar",img("parar"),"core"],["sair","Sair",img("sair"),"lugares"],["passear","Passear",img("passear"),"acoes"],
  ["escola","Escola",img("escola"),"lugares"],
].map(([id,label,image,cat]) => ({ id, label, image, cat }));

const levelTemplates = {
  inicial: ["Eu","Você","Quero","Não quero","Preciso","Sinto","Estou","Tenho","Gosto","Não gosto","Ir","Voltar","Casa","Escola","Banheiro","Comer","Beber","Dor","Ajuda","Mais","Parar","Esperar","Agora","Depois"],
  frases: ["Eu quero água","Eu quero comer","Eu quero ir ao banheiro","Eu quero brincar","Eu quero descansar","Eu quero ir embora","Eu não quero","Eu não gostei","Eu preciso de ajuda","Eu preciso esperar","Eu estou com dor","Eu estou cansado","Eu estou feliz","Eu estou triste","Eu estou com medo","Eu estou bravo","Pode me ajudar?","Pode repetir?","Onde está?","Quero ficar sozinho","Quero ficar com você","Quero mais","Acabou","Obrigado"],
  conversacao: ["Como você está?","Eu quero conversar","Eu preciso explicar","Não entendi","Pode falar devagar?","Quero escolher outra coisa","Estou desconfortável","Preciso de uma pausa","Quero ligar para alguém","Quero mudar de assunto","Isso é importante","Não foi isso que eu quis dizer","Quero participar","Tenho uma pergunta","Preciso de privacidade","Estou bem","Não estou bem","Obrigado pela ajuda","Quero tentar de novo","Terminamos por hoje"]
};

function makeEmpty(profile, level) {
  const fallbackLabels = [
    "Sim","Não","Ajuda","Mais","Parar","Esperar",
    "Água","Comer","Banheiro","Descansar",
    "Feliz","Triste","Cansado",
    "Ir","Voltar","Fazer",
    "Casa","Escola",
    "Dor","Remédio",
    "Oi","Obrigado","Por favor",
    "Emergência"
  ];

  const labels = levelTemplates[level] && levelTemplates[level].length
    ? levelTemplates[level]
    : fallbackLabels;

  return labels.map((label, index) => ({
    id: `${profile}-${level}-${index + 1}`,
    label,
    image: "",
    cat:
      index < 6 ? "core" :
      index < 10 ? "necessidades" :
      index < 13 ? "emocoes" :
      index < 16 ? "acoes" :
      index < 18 ? "lugares" :
      index < 20 ? "saude" :
      index < 23 ? "social" :
      "emergencia",
    empty: true,
  }));
}

function defaultBoard(profile, level) {
  if (profile === "infantil" && level === "emergente") return infantilEmergente;
  return makeEmpty(profile, level);
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "tdahma2@gmail.com";
  const isAdmin = userEmail === adminEmail;

  if (!isLoaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",fontSize:24,color:"#06391f"}}>
      Carregando...
    </div>
  );
  const [profile, setProfile] = useState("infantil");
  const [level, setLevel] = useState("emergente");
  const [category, setCategory] = useState("all");
  const [patientName, setPatientName] = useState("");
  const [patients, setPatients] = useState([]);
  const [activePatientId, setActivePatientId] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const [sessions, setSessions] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [cards, setCards] = useState(defaultBoard("infantil", "emergente"));
  const [phrase, setPhrase] = useState([]);
  const [editing, setEditing] = useState(null);
const [mobileEditorOpen,setMobileEditorOpen]=useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileRef = useRef(null);

  const patientPrefix = activePatientId || "sem-paciente";
  const storageKey = `caa-${patientPrefix}-${profile}-${level}`;
  const libraryCards = [
    { label: "Sim", cat: "core" }, { label: "Não", cat: "core" }, { label: "Quero", cat: "core" },
    { label: "Não quero", cat: "core" }, { label: "Ajuda", cat: "core" }, { label: "Mais", cat: "core" },
    { label: "Água", cat: "necessidades" }, { label: "Comer", cat: "necessidades" }, { label: "Banheiro", cat: "necessidades" },
    { label: "Feliz", cat: "emocoes" }, { label: "Triste", cat: "emocoes" }, { label: "Medo", cat: "emocoes" },
    { label: "Dor", cat: "saude" }, { label: "Remédio", cat: "saude" }, { label: "Médico", cat: "saude" },
    { label: "Oi", cat: "social" }, { label: "Obrigado", cat: "social" }, { label: "Por favor", cat: "social" },
    { label: "Emergência", cat: "emergencia" }, { label: "Socorro", cat: "emergencia" }, { label: "Ligar família", cat: "emergencia" }
  ];

  useEffect(() => {
    const savedPatients = localStorage.getItem("caa-patients");
    const savedSessions = localStorage.getItem("caa-sessions");
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setCards(saved ? JSON.parse(saved) : defaultBoard(profile, level));
    setEditing(null);
    setPhrase([]);
    setCategory("all");
  }, [profile, level, activePatientId]);

  function persist(next) {
    setCards(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = 0.88;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function selectCard(card) {
    setPhrase((p) => [...p, card.label]);
    setEditing(card);
    speak(card.label);
  }

  function saveEditing() {
    persist(cards.map((c) => (c.id === editing.id ? editing : c)));
    setEditing(null);
  }

  async function replaceImage(file) {
    if (!file || !editing) return;
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f6f8fb";
    ctx.fillRect(0, 0, 1200, 1200);

    const size = Math.min(image.width, image.height);
    const sx = (image.width - size) / 2;
    const sy = (image.height - size) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, sx, sy, size, size, 0, 0, 1200, 1200);

    setEditing({ ...editing, image: canvas.toDataURL("image/png"), empty: false });
  }

  function downloadImage(card) {
    if (!card.image) return;
    const a = document.createElement("a");
    a.href = card.image;
    a.download = `${card.id}.png`;
    a.click();
  }

  function addCard() {
    const card = {
      id: crypto.randomUUID(),
      label: "Novo card",
      image: "",
      cat: "core",
      empty: true,
    };
    persist([...cards, card]);
    setEditing(card);
    setEditMode(true);
  }

  function resetBoard() {
    localStorage.removeItem(storageKey);
    setCards(defaultBoard(profile, level));
    setEditing(null);
    setPhrase([]);
  }

  function createPatient() {
    const name = patientName.trim();
    if (!name) return;
    const patient = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };
    const next = [...patients, patient];
    setPatients(next);
    setActivePatientId(patient.id);
    setPatientName("");
    localStorage.setItem("caa-patients", JSON.stringify(next));
  }

  function saveSession() {
    const activePatient = patients.find((p) => p.id === activePatientId);
    const session = {
      id: crypto.randomUUID(),
      patientId: activePatientId || "",
      patientName: activePatient?.name || "Sem paciente",
      profile,
      level,
      phrase: phrase.join(" "),
      note: sessionNote,
      createdAt: new Date().toLocaleString("pt-BR"),
    };
    const next = [session, ...sessions].slice(0, 50);
    setSessions(next);
    setSessionNote("");
    localStorage.setItem("caa-sessions", JSON.stringify(next));
  }

  function addLibraryCard(item) {
    const card = {
      id: crypto.randomUUID(),
      label: item.label,
      image: "",
      cat: item.cat,
      empty: true,
    };
    persist([...cards, card]);
  }

  function printBoard() {
    window.print();
  }

  let shownCards = category === "all" ? cards : cards.filter((c) => c.cat === category);

  if (!shownCards.length && category !== "all") {
    shownCards = Array.from({ length: 6 }).map((_, index) => ({
      id: `${profile}-${level}-${category}-empty-${index + 1}`,
      label: `${categories.find((c) => c.id === category)?.label || "Card"} ${index + 1}`,
      image: "",
      cat: category,
      empty: true,
    }));
  }

  return (
    <main className={`caa-page ${editMode ? "caa-editing" : ""}`}>
      <section className="caa-clinic-panel">
        <div>
          <h2>Paciente / Usuário</h2>
          <div className="caa-patient-row">
            <input placeholder="Nome do paciente/usuário" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            <button onClick={createPatient}>Adicionar paciente</button>
          </div>
          <select value={activePatientId} onChange={(e) => setActivePatientId(e.target.value)}>
            <option value="">Sem paciente selecionado</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <h2>Sessão</h2>
          <textarea placeholder="Observações do atendimento, objetivos e evolução..." value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} />
          <div className="caa-clinic-actions">
            <button onClick={saveSession}>Salvar sessão</button>
            <button onClick={() => setShowLibrary(!showLibrary)}>Biblioteca</button>
            <button onClick={printBoard}>Imprimir / PDF</button>
          </div>
        </div>
      </section>

      {showLibrary && (
        <section className="caa-library">
          <h2>Biblioteca rápida</h2>
          <div className="caa-library-grid">
            {libraryCards.map((item, index) => (
              <button key={index} onClick={() => addLibraryCard(item)}>
                <strong>{item.label}</strong>
                <small>{categories.find((c) => c.id === item.cat)?.label}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <header className="caa-header">
        <div>
          <div className="caa-kicker">CAA Neuro</div>
          <h1>Prancha profissional de comunicação</h1>
          <p>Perfil → nível linguístico → categorias → cards editáveis.</p>
        </div>

        <div className="caa-top-actions">
          <button onClick={() => setEditMode(!editMode)}>{editMode ? "Sair da edição" : "Editar prancha"}</button>
          <button onClick={resetBoard}>Resetar</button>
        </div>
      </header>

      <section className="caa-tabs">
        {profiles.map((p) => (
          <button key={p.id} onClick={() => setProfile(p.id)} className={profile === p.id ? "active" : ""}>
            <span>{p.icon}</span>{p.label}
          </button>
        ))}
      </section>

      <section className="caa-levels">
        {levels.map((l) => (
          <button key={l.id} onClick={() => setLevel(l.id)} className={level === l.id ? "active" : ""}>
            {l.label}
          </button>
        ))}
      </section>

      <section className="caa-layout">
        <div>
          <section className="caa-phrase">
            <div className="caa-phrase-title">Frase atual</div>
            <div className="caa-words">
              {phrase.map((w, i) => <span key={i}>{w}</span>)}
              {!phrase.length && <em>Toque nos cards para montar uma frase.</em>}
            </div>

            <div className="caa-buttons">
              <button className="green" onClick={() => speak(phrase.join(" "))}>🔊 Falar frase</button>
              <button onClick={() => setPhrase([])}>Limpar</button>
              <button className="yellow" onClick={() => setPhrase((p) => p.slice(0, -1))}>Desfazer</button>
              <button className="dark" onClick={addCard}>+ Novo card</button>
            </div>
          </section>

          <section className="caa-category-row">
            <button onClick={() => setCategory("all")} className={category === "all" ? "active" : ""}>Todos</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} className={category === cat.id ? "active" : ""}>
                {cat.label}
              </button>
            ))}
          </section>

          <section className="caa-board">
            {shownCards.map((card) => (
              <article key={card.id} className={`caa-card cat-${card.cat} ${editing?.id === card.id ? "active" : ""}`}>
                <div className="caa-card-inner">
                  <button className="caa-card-button" onClick={() => selectCard(card)}>
                    <div className="caa-image-frame">
                      {card.image ? <img src={card.image} alt={card.label} /> : <div className="caa-empty">+</div>}
                    </div>
                    <div className="caa-label">{card.label}</div>
                  </button>

                  {editMode && (
                    <div className="caa-tools">
                      <button onClick={() => setEditing(card)}>Editar</button>
                      <button onClick={() => downloadImage(card)}>Baixar</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        </div>

        <aside className="caa-editor">
          <h2>Editor do card</h2>
          {editing ? (
            <>
              <div className="caa-editor-preview">
                {editing.image ? <img src={editing.image} alt={editing.label} /> : <div className="caa-empty large">+</div>}
              </div>

              <label>Nome do card</label>
              <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />

              <label>Categoria</label>
              <select value={editing.cat} onChange={(e) => setEditing({ ...editing, cat: e.target.value })}>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>

              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => replaceImage(e.target.files?.[0])} />

              <button onClick={() => fileRef.current?.click()}>Trocar imagem</button>
              <button onClick={() => downloadImage(editing)}>Baixar imagem</button>
              <button className="green" onClick={saveEditing}>Salvar alterações</button>
              <button onClick={() => setEditing(null)}>Cancelar</button>
            </>
          ) : (
            <p>Selecione um card para editar nome, categoria e imagem.</p>
          )}
        </aside>
      </section>
      <section className="caa-sessions">
        <h2>Histórico de sessões</h2>
        {!sessions.length && <p>Nenhuma sessão salva ainda.</p>}
        {sessions.map((session) => (
          <article key={session.id}>
            <strong>{session.patientName}</strong>
            <span>{session.createdAt}</span>
            <p><b>Perfil:</b> {session.profile} · <b>Nível:</b> {session.level}</p>
            {session.phrase && <p><b>Frase:</b> {session.phrase}</p>}
            {session.note && <p><b>Observações:</b> {session.note}</p>}
          </article>
        ))}
      </section>
    
{editing && mobileEditorOpen && (
<div className="caa-mobile-overlay"
onClick={()=>setMobileEditorOpen(false)}>

<div
className="caa-mobile-editor"
onClick={(e)=>e.stopPropagation()}>

<h2>Editar card</h2>

<div className="caa-mobile-preview">

{cards.find(c=>c.id===editing)?.image
? <img
src={cards.find(c=>c.id===editing)?.image}
/>
:
<div className="caa-empty large">+</div>
}

</div>

<label>Nome</label>

<input
value={cards.find(c=>c.id===editing)?.label||""}
onChange={(e)=>{

const next=[...cards];

const i=next.findIndex(
x=>x.id===editing
);

if(i>-1){

next[i]={
...next[i],
label:e.target.value
};

setCards(next);

}

}}
/>

<label>Trocar imagem</label>

<input
type="file"
accept="image/*"
onChange={(e)=>{

const file=e.target.files?.[0];

if(!file)return;

const r=new FileReader();

r.onload=()=>{

const next=[...cards];

const i=next.findIndex(
x=>x.id===editing
);

if(i>-1){

next[i]={
...next[i],
image:r.result
};

setCards(next);

}

};

r.readAsDataURL(file);

}}
/>

<button
className="green"
onClick={()=>{

localStorage.setItem(
storageKey,
JSON.stringify(cards)
);

setMobileEditorOpen(false);

}}
>

Salvar

</button>

<button
onClick={()=>setMobileEditorOpen(false)}
>

Cancelar

</button>

</div>
</div>
)}

</main>
  );
}
