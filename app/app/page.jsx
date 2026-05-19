"use client";

import { useEffect, useRef, useState } from "react";
import Onboarding from "../components/Onboarding";
import { UserButton } from "@clerk/nextjs";
import PWABanner from "../components/PWABanner";

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
  const fallbackLabels = ["Sim","Não","Ajuda","Mais","Parar","Esperar","Água","Comer","Banheiro","Descansar","Feliz","Triste","Cansado","Ir","Voltar","Fazer","Casa","Escola","Dor","Remédio","Oi","Obrigado","Por favor","Emergência"];
  const labels = levelTemplates[level]?.length ? levelTemplates[level] : fallbackLabels;
  return labels.map((label, i) => ({
    id: `${profile}-${level}-${i+1}`, label, image: "",
    cat: i<6?"core":i<10?"necessidades":i<13?"emocoes":i<16?"acoes":i<18?"lugares":i<20?"saude":i<23?"social":"emergencia",
    empty: true,
  }));
}

function defaultBoard(profile, level) {
  if (profile === "infantil" && level === "emergente") return infantilEmergente;
  return makeEmpty(profile, level);
}

export default function Home() {
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
  const [editMode, setEditMode] = useState(false);

  // Image picker
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imageLibrary, setImageLibrary] = useState({ platformImages: [], userImages: [] });
  const [imageLibraryLoading, setImageLibraryLoading] = useState(false);
  const [pickerTab, setPickerTab] = useState("buscar"); // "buscar" | "minhas" | "gerar"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // fal.ai
  const [generating, setGenerating] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generateError, setGenerateError] = useState("");

  const fileRef = useRef(null);

  const libraryCards = [
    { label: "Sim", cat: "core" },{ label: "Não", cat: "core" },{ label: "Quero", cat: "core" },
    { label: "Não quero", cat: "core" },{ label: "Ajuda", cat: "core" },{ label: "Mais", cat: "core" },
    { label: "Água", cat: "necessidades" },{ label: "Comer", cat: "necessidades" },{ label: "Banheiro", cat: "necessidades" },
    { label: "Feliz", cat: "emocoes" },{ label: "Triste", cat: "emocoes" },{ label: "Medo", cat: "emocoes" },
    { label: "Dor", cat: "saude" },{ label: "Remédio", cat: "saude" },{ label: "Médico", cat: "saude" },
    { label: "Oi", cat: "social" },{ label: "Obrigado", cat: "social" },{ label: "Por favor", cat: "social" },
    { label: "Emergência", cat: "emergencia" },{ label: "Socorro", cat: "emergencia" },{ label: "Ligar família", cat: "emergencia" }
  ];

  useEffect(() => {
    async function loadD1Data() {
      try {
        const [pr, sr] = await Promise.all([fetch("/api/patients"), fetch("/api/sessions")]);
        if (pr.ok) { const d = await pr.json(); setPatients(d.patients || []); }
        if (sr.ok) { const d = await sr.json(); setSessions(d.sessions || []); }
      } catch(e) { console.error(e); }
    }
    loadD1Data();
  }, []);

  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch(`/api/cards?profile=${profile}&level=${level}`);
        const data = await res.json();
        if (res.ok && data.cards?.length) {
          setCards(data.cards.map(c => ({ id: c.id, label: c.label, image: c.image_url, cat: c.category })));
        } else { setCards(defaultBoard(profile, level)); }
      } catch { setCards(defaultBoard(profile, level)); }
    }
    loadCards();
    setEditing(null); setPhrase([]); setCategory("all");
  }, [profile, level, activePatientId]);

  async function persist(next) {
    setCards(next);
    try {
      await fetch("/api/cards", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ profile, level, cards: next }) });
    } catch { alert("Não foi possível salvar os cards."); }
  }

  const [ttsLang, setTtsLang] = useState("pt-BR");
  const [shareUrl, setShareUrl] = useState(null);
  const [sharing, setSharing] = useState(false);

  async function shareBoard() {
    if (!cards.length) return alert("Adicione cards antes de compartilhar.");
    setSharing(true);
    try {
      const res = await fetch("/api/share", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ profile, level, cards, title: "Prancha CAA" }) });
      const data = await res.json();
      if (data.url) { setShareUrl(data.url); navigator.clipboard?.writeText(data.url); }
      else alert("Erro ao compartilhar.");
    } catch { alert("Erro ao compartilhar."); }
    setSharing(false);
  }

  async function speak(text) {
    try {
      const res = await fetch("/api/tts", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text, lang: ttsLang }) });
      const data = await res.json();
      if (data.audio) { const a = new Audio(`data:audio/mp3;base64,${data.audio}`); a.play(); return; }
    } catch {}
    const u = new SpeechSynthesisUtterance(text); u.lang = ttsLang; u.rate = 0.88; speechSynthesis.cancel(); speechSynthesis.speak(u);
  }

  function selectCard(card) { setPhrase(p => [...p, card.label]); setEditing(card); speak(card.label); }
  function saveEditing() { persist(cards.map(c => c.id === editing.id ? editing : c)); setEditing(null); }

  function downloadImage(card) {
    if (!card.image) return;
    const a = document.createElement("a"); a.href = card.image; a.download = `${card.id}.png`; a.click();
  }

  function addCard() {
    const card = { id: crypto.randomUUID(), label: "Novo card", image: "", cat: "core", empty: true };
    persist([...cards, card]); setEditing(card); setEditMode(true);
  }

  async function resetBoard() { const next = defaultBoard(profile, level); await persist(next); setEditing(null); setPhrase([]); }

  async function createPatient() {
    const name = patientName.trim(); if (!name) return;
    try {
      const res = await fetch("/api/patients", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ nome: name }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setPatients(p => [...p, { id: data.id, nome: name }]);
      setActivePatientId(data.id); setPatientName("");
    } catch { alert("Não foi possível salvar o paciente."); }
  }

  async function saveSession() {
    const activePatient = patients.find(p => p.id === activePatientId || p.id === Number(activePatientId));
    try {
      const res = await fetch("/api/sessions", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ patient_id: activePatientId || null, evolucao_observada: sessionNote, objetivos_sessao: `Perfil: ${profile} | Nível: ${level}`, notas: phrase.length ? `Frases: ${phrase.join(" ")}` : null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setSessions(s => [{ id: data.id, patientName: activePatient?.nome || "Sem paciente", evolucao_observada: sessionNote, created_at: new Date().toISOString() }, ...s].slice(0, 50));
      setSessionNote(""); alert("Sessão salva com sucesso.");
    } catch { alert("Não foi possível salvar a sessão."); }
  }

  function addLibraryCard(item) {
    persist([...cards, { id: crypto.randomUUID(), label: item.label, image: "", cat: item.cat, empty: true }]);
  }

  async function openImagePicker() {
    setImagePickerOpen(true);
    setPickerTab("buscar");
    setSearchQuery(editing?.label || "");
    setSearchResults([]);
    setGeneratePrompt(editing?.label || "");
    setGenerateError("");
    setImageLibraryLoading(true);
    try {
      const res = await fetch("/api/images/library");
      const data = await res.json();
      setImageLibrary({ platformImages: data.platformImages || [], userImages: data.userImages || [] });
    } catch {}
    finally { setImageLibraryLoading(false); }
    // Auto-buscar pelo nome do card
    if (editing?.label) { searchArasaac(editing.label); }
  }

  async function searchArasaac(q) {
    if (!q?.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {}
    finally { setSearchLoading(false); }
  }

  function chooseImage(url, label) {
    if (!editing) return;
    setEditing({ ...editing, image: url, empty: false });
    setImagePickerOpen(false);
  }

  async function uploadImageToLibrary(file) {
    if (!file || !editing) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", editing.label || "Imagem do card");
    setImageLibraryLoading(true);
    try {
      const res = await fetch("/api/images/upload", { method:"POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setEditing({ ...editing, image: data.url, empty: false });
      setImagePickerOpen(false);
    } catch { alert("Não foi possível enviar a imagem."); }
    finally { setImageLibraryLoading(false); }
  }

  async function generateImage() {
    if (!editing || !generatePrompt.trim()) return;
    setGenerating(true); setGenerateError("");
    try {
      const res = await fetch("/api/generate-card-image", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ descricao: generatePrompt, estilo: "pictograma" })
      });
      const data = await res.json();
      if (data.error === "geração_bloqueada") {
        setGenerateError("Disponível no plano Pro.");
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setEditing({ ...editing, image: data.url, empty: false });
      setImagePickerOpen(false);
    } catch(e) { setGenerateError(e.message || "Erro ao gerar. Tente novamente."); }
    finally { setGenerating(false); }
  }

  let shownCards = category === "all" ? cards : cards.filter(c => c.cat === category);
  if (!shownCards.length && category !== "all") {
    shownCards = Array.from({length:6}).map((_,i) => ({ id:`${profile}-${level}-${category}-empty-${i+1}`, label:`${categories.find(c=>c.id===category)?.label||"Card"} ${i+1}`, image:"", cat:category, empty:true }));
  }

  const tabStyle = (active) => ({ padding:"8px 16px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:"500", background: active ? "#2563eb" : "transparent", color: active ? "white" : "#6b7280" });

  return (
    <main className={`caa-page ${editMode ? "caa-editing" : ""}`}>
      <section className="caa-clinic-panel">
        <div>
          <h2>Paciente / Usuário</h2>
          <div className="caa-patient-row">
            <input placeholder="Nome do paciente/usuário" value={patientName} onChange={e=>setPatientName(e.target.value)} />
            <button onClick={createPatient}>Adicionar paciente</button>
          </div>
          <select value={activePatientId} onChange={e=>setActivePatientId(e.target.value)}>
            <option value="">Sem paciente selecionado</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nome||p.name}</option>)}
          </select>
          {activePatientId && (
            <div style={{marginTop:"8px",display:"flex",gap:"8px"}}>
              <a href="/pacientes" style={{fontSize:"12px",color:"#2563eb",textDecoration:"underline"}}>Ver prontuário →</a>
              <a href={`/api/report?patient_id=${activePatientId}`} target="_blank" style={{fontSize:"12px",color:"#16a34a",textDecoration:"underline"}}>Baixar PDF</a>
            </div>
          )}
        </div>
        <div>
          <h2>Sessão</h2>
          <textarea placeholder="Observações do atendimento..." value={sessionNote} onChange={e=>setSessionNote(e.target.value)} />
          <div className="caa-clinic-actions">
            <button onClick={saveSession}>Salvar sessão</button>
            <button onClick={()=>setShowLibrary(!showLibrary)}>Biblioteca</button>
            <button onClick={()=>window.print()}>Imprimir / PDF</button>
          </div>
        </div>
      </section>

      {showLibrary && (
        <section className="caa-library">
          <h2>Biblioteca rápida</h2>
          <div className="caa-library-grid">
            {libraryCards.map((item,i) => (
              <button key={i} onClick={()=>addLibraryCard(item)}>
                <strong>{item.label}</strong>
                <small>{categories.find(c=>c.id===item.cat)?.label}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <PWABanner />
      <nav style={{background:"#071b2c",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #00885f"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
        <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
        <a href="/biblioteca" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📚 Biblioteca</a>
        <a href="/paciente" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👤 Modo Paciente</a>
        <a href="/atividades" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🎮 Atividades</a>
        <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(78,201,160,0.2)",border:"1px solid #4ec9a0",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>✨ Relatório IA</a>
        <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👥 Pacientes</a>
        <div style={{marginLeft:"auto",display:"flex",gap:"8px",alignItems:"center"}}>
          <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px"}}>❓ Ajuda</a>
        </div>
      </nav>
      <header className="caa-header">
        <div>
          <div className="caa-kicker">CAA Neuro</div>
          <div className="appTopBar">
            <div className="appTopBar">
              <h1>Prancha profissional de comunicação</h1>
              <div className="appLogout">
                <UserButton appearance={{elements:{avatarBox:{width:"44px",height:"44px"}}}} afterSignOutUrl="/" />
              </div>
            </div>
          </div>
          <p>Perfil → nível linguístico → categorias → cards editáveis.</p>
        </div>
        <div className="caa-top-actions">
          <button onClick={()=>setEditMode(!editMode)}>{editMode?"Sair da edição":"Editar prancha"}</button>
          <button onClick={resetBoard}>Resetar</button>
        </div>
      </header>

      <section className="caa-tabs">
        {profiles.map(p => (
          <button key={p.id} onClick={()=>setProfile(p.id)} className={profile===p.id?"active":""}>
            <span>{p.icon}</span>{p.label}
          </button>
        ))}
      </section>

      <section className="caa-levels">
        {levels.map(l => <button key={l.id} onClick={()=>setLevel(l.id)} className={level===l.id?"active":""}>{l.label}</button>)}
      </section>

      <section className="caa-layout">
        <div>
          <section className="caa-phrase">
            <div className="caa-phrase-title">Frase atual</div>
            <div className="caa-words">
              {phrase.map((w,i)=><span key={i}>{w}</span>)}
              {!phrase.length && <em>Toque nos cards para montar uma frase.</em>}
            </div>
            <div className="caa-buttons">
              <button className="green" onClick={()=>speak(phrase.join(" "))}>🔊 Falar frase</button>
              <select value={ttsLang} onChange={e=>setTtsLang(e.target.value)} style={{padding:"6px 10px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"13px",cursor:"pointer"}}>
                <option value="pt-BR">🇧🇷 PT-BR</option>
                <option value="pt-PT">🇵🇹 PT-PT</option>
                <option value="en-US">🇺🇸 EN</option>
                <option value="es-ES">🇪🇸 ES</option>
                <option value="fr-FR">🇫🇷 FR</option>
                <option value="de-DE">🇩🇪 DE</option>
              </select>
              <button onClick={()=>setPhrase([])}>Limpar</button>
              <button className="yellow" onClick={()=>setPhrase(p=>p.slice(0,-1))}>Desfazer</button>
              <button className="dark" onClick={addCard}>+ Novo card</button>
              <button onClick={()=>window.location.href="/biblioteca"} style={{background:"#7c3aed",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>📚 Biblioteca</button>
              <button onClick={shareBoard} disabled={sharing} style={{background:"#6366f1",color:"white",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>
                {sharing ? "..." : "🔗 Compartilhar"}
              </button>
              {shareUrl && (
                <div style={{background:"#f0fdf4",border:"1px solid #00885f",borderRadius:"10px",padding:"10px 14px",fontSize:"13px",display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap",width:"100%",marginTop:"6px"}}>
                  <span style={{color:"#065f46",fontWeight:"600"}}>✅ Link copiado!</span>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{color:"#00885f",wordBreak:"break-all"}}>{shareUrl}</a>
                  <button onClick={()=>setShareUrl(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:"16px"}}>✕</button>
                </div>
              )}
            </div>
          </section>

          <section className="caa-category-row">
            <button onClick={()=>setCategory("all")} className={category==="all"?"active":""}>Todos</button>
            {categories.map(cat=>(
              <button key={cat.id} onClick={()=>setCategory(cat.id)} className={category===cat.id?"active":""}>{cat.label}</button>
            ))}
          </section>

          <section className="caa-board">
            {shownCards.map(card=>(
              <article key={card.id} className={`caa-card cat-${card.cat} ${editing?.id===card.id?"active":""}`}>
                <div className="caa-card-inner">
                  <button className="caa-card-button" onClick={()=>selectCard(card)}>
                    <div className="caa-image-frame">
                      {card.image ? <img src={card.image} alt={card.label} /> : <div className="caa-empty">+</div>}
                    </div>
                    <div className="caa-label">{card.label}</div>
                  </button>
                  {editMode && (
                    <div className="caa-tools">
                      <button onClick={()=>setEditing(card)}>Editar</button>
                      <button onClick={()=>downloadImage(card)}>Baixar</button>
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
              <input value={editing.label} onChange={e=>setEditing({...editing,label:e.target.value})} />
              <label>Categoria</label>
              <select value={editing.cat} onChange={e=>setEditing({...editing,cat:e.target.value})}>
                {categories.map(cat=><option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>uploadImageToLibrary(e.target.files?.[0])} />
              <button onClick={openImagePicker}>🔍 Buscar / Gerar imagem</button>
              <button onClick={()=>downloadImage(editing)}>Baixar imagem</button>
              <button className="green" onClick={saveEditing}>Salvar alterações</button>
              <button onClick={()=>setEditing(null)}>Cancelar</button>
            </>
          ) : (
            <p>Selecione um card para editar nome, categoria e imagem.</p>
          )}
        </aside>
      </section>

      <section className="caa-sessions">
        <h2>Histórico de sessões</h2>
        {!sessions.length && <p>Nenhuma sessão salva ainda.</p>}
        {sessions.map(session=>(
          <article key={session.id}>
            <strong>{session.patientName||session.paciente_nome||"Sem paciente"}</strong>
            <span>{session.created_at ? new Date(session.created_at).toLocaleString("pt-BR") : ""}</span>
            {session.evolucao_observada && <p><b>Evolução:</b> {session.evolucao_observada}</p>}
            {session.notas && <p><b>Notas:</b> {session.notas}</p>}
          </article>
        ))}
      </section>

      {/* Modal unificado: Buscar + Minhas imagens + Gerar com IA */}
      {imagePickerOpen && (
        <div className="imagePickerOverlay" onClick={()=>setImagePickerOpen(false)}>
          <div className="imagePickerModal" style={{maxWidth:"680px",width:"95%"}} onClick={e=>e.stopPropagation()}>
            <div className="imagePickerHeader">
              <div>
                <h2>Banco de imagens</h2>
                <p>Busque em 45.000+ pictogramas ou gere com IA</p>
              </div>
              <button onClick={()=>setImagePickerOpen(false)} style={{fontSize:"24px",background:"none",border:"none",cursor:"pointer"}}>×</button>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:"4px",padding:"0 0 16px",borderBottom:"1px solid #e5e7eb",marginBottom:"16px"}}>
              {[["buscar","🔍 Buscar pictogramas"],["minhas","📁 Minhas imagens"],["gerar","✨ Gerar com IA"]].map(([id,label])=>(
                <button key={id} style={tabStyle(pickerTab===id)} onClick={()=>setPickerTab(id)}>{label}</button>
              ))}
            </div>

            {/* Tab: Buscar ARASAAC */}
            {pickerTab==="buscar" && (
              <div>
                <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
                  <input
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&searchArasaac(searchQuery)}
                    placeholder="Ex: água, comer, feliz, escola..."
                    style={{flex:1,padding:"10px 12px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px"}}
                  />
                  <button
                    onClick={()=>searchArasaac(searchQuery)}
                    disabled={searchLoading}
                    style={{padding:"10px 20px",background:"#2563eb",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}
                  >
                    {searchLoading?"...":"Buscar"}
                  </button>
                </div>
                {searchLoading && <p style={{textAlign:"center",color:"#6b7280",fontSize:"13px"}}>Buscando pictogramas ARASAAC...</p>}
                {!searchLoading && searchResults.length===0 && searchQuery && (
                  <p style={{textAlign:"center",color:"#9ca3af",fontSize:"13px"}}>Nenhum resultado. Tente outra palavra.</p>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:"8px",maxHeight:"380px",overflowY:"auto"}}>
                  {searchResults.map(item=>(
                    <button key={item.id} onClick={()=>chooseImage(item.url, item.label)}
                      style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",transition:"border-color 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#2563eb"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e5e7eb"}
                    >
                      <img src={item.url} alt={item.label} style={{width:"64px",height:"64px",objectFit:"contain"}} />
                      <span style={{fontSize:"11px",color:"#374151",textAlign:"center",lineHeight:"1.3"}}>{item.label}</span>
                    </button>
                  ))}
                </div>
                <p style={{fontSize:"11px",color:"#9ca3af",marginTop:"12px",textAlign:"center"}}>
                  Pictogramas ARASAAC — licença Creative Commons (CC BY-NC-SA 4.0)
                </p>
              </div>
            )}

            {/* Tab: Minhas imagens */}
            {pickerTab==="minhas" && (
              <div>
                <div style={{marginBottom:"12px"}}>
                  <button onClick={()=>fileRef.current?.click()}
                    style={{padding:"10px 20px",border:"1px dashed #d1d5db",borderRadius:"8px",background:"white",cursor:"pointer",fontSize:"13px",color:"#374151",width:"100%"}}
                  >
                    + Enviar imagem do dispositivo
                  </button>
                </div>
                {imageLibraryLoading && <p style={{textAlign:"center",color:"#6b7280",fontSize:"13px"}}>Carregando...</p>}
                {!!imageLibrary.userImages.length && (
                  <>
                    <p style={{fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"8px"}}>Suas imagens enviadas</p>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:"8px",marginBottom:"16px"}}>
                      {imageLibrary.userImages.map(image=>(
                        <button key={image.id} onClick={()=>chooseImage(image.url, image.label)}
                          style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}
                        >
                          <img src={image.url} alt={image.label} style={{width:"64px",height:"64px",objectFit:"contain"}} />
                          <span style={{fontSize:"11px",color:"#374151",textAlign:"center"}}>{image.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {!!imageLibrary.platformImages.length && (
                  <>
                    <p style={{fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"8px"}}>Banco da plataforma</p>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:"8px"}}>
                      {imageLibrary.platformImages.map(image=>(
                        <button key={image.id} onClick={()=>chooseImage(image.url, image.label)}
                          style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}
                        >
                          <img src={image.url} alt={image.label} style={{width:"64px",height:"64px",objectFit:"contain"}} />
                          <span style={{fontSize:"11px",color:"#374151",textAlign:"center"}}>{image.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab: Gerar com IA */}
            {pickerTab==="gerar" && (
              <div>
                <div style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:"12px",padding:"20px"}}>
                  <p style={{fontSize:"13px",color:"#5b21b6",fontWeight:"600",marginBottom:"4px"}}>✨ Geração de imagem com IA</p>
                  <p style={{fontSize:"12px",color:"#7c3aed",marginBottom:"16px"}}>Powered by fal.ai — disponível no plano Pro</p>
                  <label style={{fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"6px"}}>Descreva a imagem que você quer:</label>
                  <input
                    value={generatePrompt}
                    onChange={e=>setGeneratePrompt(e.target.value)}
                    placeholder={`Ex: pictograma simples de "${editing?.label||"água"}"`}
                    onKeyDown={e=>e.key==="Enter"&&generateImage()}
                    style={{width:"100%",padding:"10px 12px",borderRadius:"8px",border:"1px solid #c4b5fd",fontSize:"14px",marginBottom:"12px",boxSizing:"border-box"}}
                  />
                  {generateError && (
                    <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",padding:"10px",marginBottom:"12px",fontSize:"12px",color:"#dc2626"}}>
                      {generateError}
                      {generateError.includes("Pro") && (
                        <a href="/planos" style={{display:"block",marginTop:"4px",color:"#2563eb",fontWeight:"600"}}>Ver planos →</a>
                      )}
                    </div>
                  )}
                  <button
                    onClick={generateImage}
                    disabled={generating||!generatePrompt.trim()}
                    style={{width:"100%",padding:"12px",background:generating?"#a78bfa":"#7c3aed",color:"white",border:"none",borderRadius:"8px",fontWeight:"600",cursor:generating?"wait":"pointer",fontSize:"14px"}}
                  >
                    {generating?"Gerando imagem...":"Gerar imagem com IA"}
                  </button>
                  <p style={{fontSize:"11px",color:"#9ca3af",marginTop:"8px",textAlign:"center"}}>
                    Tempo estimado: 3–8 segundos por imagem
                  </p>
                </div>
                <div style={{marginTop:"16px",padding:"12px",background:"#f9fafb",borderRadius:"8px",fontSize:"12px",color:"#6b7280"}}>
                  <strong>Plano Gratuito:</strong> use os 45.000+ pictogramas ARASAAC<br/>
                  <strong>Plano Pro:</strong> gere imagens únicas e personalizadas com IA<br/>
                  <a href="/planos" style={{color:"#2563eb",marginTop:"4px",display:"inline-block"}}>Ver diferença entre planos →</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    <Onboarding />
    </main>
  );
}
