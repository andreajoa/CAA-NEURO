"use client";
import AppShell from "../components/AppShell";

import { useEffect, useRef, useState } from "react";
import DwellButton from "../components/DwellButton";
import { useAccessibility, AccessibilityPanel, DIAGNOSTICO_PROFILES } from "../components/AccessibilityEngine";
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
  const [nextSuggestions, setNextSuggestions] = useState([]);
  const [showQuickFires, setShowQuickFires] = useState(false);
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
        let base;
        if (res.ok && data.cards?.length) {
          base = data.cards.map(c => ({ id: c.id, label: c.label, image: c.image_url || c.image || "", cat: c.category }));
        } else {
          // Tenta board padrão do admin para este perfil+nível
          try {
            const ar = await fetch(`/api/admin/default-board?profile=${profile}&level=${level}`);
            const ad = await ar.json();
            base = (ar.ok && ad.cards?.length) ? ad.cards : defaultBoard(profile, level);
          } catch { base = defaultBoard(profile, level); }
        }

        // Para cards sem imagem, usa imagem local se existir
        const LOCAL_IDS = ["sim","nao","me-da","nao-quero","mais","acabou","ajuda","esperar","agua","comer","banheiro","dor","dormir","tomar-banho","remedio","feliz","triste","bravo","medo","cansado","brincar","parar","sair","passear","escola"];
        const enriched = base.map((c) => {
          if (c.image) return c;
          if (LOCAL_IDS.includes(c.id)) return { ...c, image: `/cards/level-1/${c.id}.png` };
          return c;
        });

        setCards(enriched);
      } catch { setCards(defaultBoard(profile, level)); }
    }
    loadCards();
    setEditing(null); setPhrase([]); setCategory("all");
  }, [profile, level, activePatientId]);

  async function persist(next) {
    setCards(next);
    try {
      await fetch("/api/cards", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ profile, level, cards: next }) });
      // Se for admin, salvar também como padrão global
      const isAdminUser = await fetch("/api/plano").then(r=>r.json()).then(d=>d.plano==="admin").catch(()=>false);
      if (isAdminUser && profile === "infantil" && level === "emergente") {
        await fetch("/api/admin/default-board", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ cards: next }) }).catch(()=>{});
      }
    } catch { alert("Não foi possível salvar os cards."); }
  }

  const [ttsLang, setTtsLang] = useState("pt-BR");
  const [ttsGender, setTtsGender] = useState("NEUTRAL"); // FEMALE | MALE | CHILD | NEUTRAL
  const [dwellMs, setDwellMs] = useState(0); // 0 = desativado
  const [diagnostico, setDiagnostico] = useState("padrao");
  const [showAccessibility, setShowAccessibility] = useState(false);
  const { config: a11yConfig, overrides: a11yOverrides, setOverrides: setA11yOverrides,
          applyIntelliTouch, contrastFilter, fontScale, positionLocked } = useAccessibility(diagnostico);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileTab, setMobileTab] = useState("prancha");
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imagePickerError, setImagePickerError] = useState("");

  // Aplicar tema escuro no <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("caa-dark", darkMode ? "1" : "0");
  }, [darkMode]);

  // Restaurar preferência salva
  useEffect(() => {
    const saved = localStorage.getItem("caa-dark");
    if (saved === "1") setDarkMode(true);
    const savedDwell = localStorage.getItem("caa-dwell");
    if (savedDwell) setDwellMs(Number(savedDwell));
    const savedGender = localStorage.getItem("caa-gender");
    if (savedGender) setTtsGender(savedGender);
  }, []);

  useEffect(() => { localStorage.setItem("caa-dwell", dwellMs); }, [dwellMs]);
  useEffect(() => {
    const saved = localStorage.getItem("caa-diagnostico");
    if (saved) setDiagnostico(saved);
  }, []);
  useEffect(() => { localStorage.setItem("caa-diagnostico", diagnostico); }, [diagnostico]);
  useEffect(() => { localStorage.setItem("caa-gender", ttsGender); }, [ttsGender]);
  useEffect(() => {
    function updateIsMobile() { setIsMobile(window.innerWidth <= 700); }
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

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
      const res = await fetch("/api/tts", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ text, lang: ttsLang, gender: ttsGender, profile }) });
      const data = await res.json();
      if (data.audio) { const a = new Audio(`data:audio/mp3;base64,${data.audio}`); a.play(); return; }
      // fallback: traduz no cliente antes de falar
      const spoken = data.translatedText || text;
      const u = new SpeechSynthesisUtterance(spoken);
      const voices = speechSynthesis.getVoices();
      const v = voices.find(v => v.lang === ttsLang) || voices.find(v => v.lang.startsWith(ttsLang.split("-")[0]));
      if (v) u.voice = v;
      u.lang = ttsLang; u.rate = ttsRate || 1; speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = ttsLang; u.rate = ttsRate || 1; speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  }


  const selectCard = applyIntelliTouch(function selectCard(card) {
    if (editMode) return;
    setPhrase(p => {
      const next = [...p, card.label];
      const last = next.slice(-3).join(",");
      const pid = activePatientId ? `&patient_id=${activePatientId}` : "";
      fetch(`/api/suggest-cards?last=${encodeURIComponent(last)}${pid}`)
        .then(r => r.json())
        .then(d => setNextSuggestions(d.next_suggestions || []))
        .catch(() => {});
      return next;
    });
    speak(card.label);
  });
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
    if (!editing) return;
    setImagePickerOpen(true);
    setPickerTab("buscar");
    setSearchQuery(editing.label || "");
    setSearchResults([]);
    setGeneratePrompt(editing.label || "");
    setGenerateError("");
    setImagePickerError("");
    setImageLibraryLoading(true);
    try {
      const res = await fetch("/api/images/library");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Erro ${res.status} ao carregar biblioteca`);
      setImageLibrary({ platformImages: data.platformImages || [], userImages: data.userImages || [] });
    } catch (e) {
      console.error("Erro ao abrir banco de imagens:", e);
      setImagePickerError(e.message || "Não foi possível carregar o banco de imagens.");
    } finally {
      setImageLibraryLoading(false);
    }
    if (editing?.label?.trim()) {
      await searchPictogramas(editing.label.trim(), searchSource);
    } else {
      setImagePickerError("Este card está sem nome. Dê um nome para buscar imagens.");
    }
  }

  const [searchSource, setSearchSource] = useState("all");

  async function searchPictogramas(q, source) {
    if (!q?.trim()) {
      setImagePickerError("Digite um termo para buscar.");
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setImagePickerError("");
    try {
      const src = source || searchSource || "all";
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}&source=${src}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Erro ${res.status} ao buscar imagens`);
      const results = data.results || [];
      setSearchResults(results);
      if (!results.length) {
        setImagePickerError(`Nenhuma imagem encontrada para "${q}".`);
      }
    } catch (e) {
      setSearchResults([]);
      setImagePickerError(e.message || "Não foi possível buscar imagens agora.");
    }
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
    setImagePickerError("");
    try {
      const res = await fetch("/api/images/upload", { method:"POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Erro ${res.status} ao enviar imagem`);
      setEditing({ ...editing, image: data.url, empty: false });
      setImagePickerOpen(false);
    } catch (e) {
      console.error("Erro ao enviar imagem:", e);
      setImagePickerError(e.message || "Não foi possível enviar a imagem.");
    }
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
    <AppShell>
    <main className={`caa-page ${editMode ? "caa-editing" : ""}`}>


      <PWABanner />

      <header className="caa-header">
        <div>
          <div className="caa-kicker">CAA Neuro</div>
          <div className="appTopBar">
            <div className="appTopBar">
              <h1>Prancha profissional de comunicação</h1>
              <div className="appLogout" style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <a href="/profissional" style={{fontSize:"12px",color:"#6b7280",textDecoration:"none",border:"1px solid #e5e7eb",padding:"6px 12px",borderRadius:"8px",background:"white",whiteSpace:"nowrap"}}>Painel →</a>
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

      {isMobile ? (
        <section className="caa-mobile-filters">
          <div className="caa-mobile-filter">
            <label>Perfil</label>
            <select value={profile} onChange={e=>setProfile(e.target.value)}>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
            </select>
          </div>
        </section>
      ) : (
        <section className="caa-tabs">
          {profiles.map(p => (
            <button key={p.id} onClick={()=>setProfile(p.id)} className={profile===p.id?"active":""}>
              <span>{p.icon}</span>{p.label}
            </button>
          ))}
        </section>
      )}

      {isMobile ? (
        <section className="caa-mobile-filters">
          <div className="caa-mobile-filter">
            <label>Nível</label>
            <select value={level} onChange={e=>setLevel(e.target.value)}>
              {levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
        </section>
      ) : (
        <section className="caa-levels">
          {levels.map(l => <button key={l.id} onClick={()=>setLevel(l.id)} className={level===l.id?"active":""}>{l.label}</button>)}
        </section>
      )}

      <section className="caa-layout">
        <div>
          <section className="caa-phrase">
            <div className="caa-phrase-title">Frase atual</div>
            <div className="caa-words">
              {phrase.map((w,i)=><span key={i}>{w}</span>)}
              {!phrase.length && <em>Toque nos cards para montar uma frase.</em>}
            </div>
            {nextSuggestions.length > 0 && (
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",padding:"8px 0 4px",borderBottom:"1px solid #e5e7eb",marginBottom:"4px"}}>
                <span style={{fontSize:"11px",color:"#9ca3af",alignSelf:"center",marginRight:"2px"}}>💡 Próximo:</span>
                {nextSuggestions.map((s,i) => (
                  <button key={i} onClick={()=>{speak(s);setPhrase(p=>[...p,s]);}}
                    style={{background:"#eff6ff",border:"1px solid #bfdbfe",color:"#2563eb",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {showQuickFires && (
              <div style={{background:"#faf5ff",border:"1px solid #e9d5ff",borderRadius:"10px",padding:"10px",marginBottom:"8px"}}>
                <div style={{fontSize:"12px",fontWeight:"700",color:"#7c3aed",marginBottom:"8px"}}>⚡ QuickFires — frases rápidas</div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                  {["Preciso de ajuda","Eu quero água","Eu quero comer","Preciso ir ao banheiro","Eu estou com dor","Pode repetir?","Não entendi","Eu quero parar","Estou cansado","Eu quero brincar","Obrigado","Por favor"].map((f,i) => (
                    <button key={i} onClick={()=>{speak(f);setPhrase(p=>[...p,...f.split(" ")]);}}
                      style={{background:"white",border:"1px solid #e9d5ff",color:"#374151",padding:"6px 12px",borderRadius:"20px",fontSize:"13px",cursor:"pointer",fontWeight:"600"}}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="caa-buttons">
              <button className="green" onClick={()=>speak(phrase.join(" "))}>🔊 Falar frase</button>
              <button className="yellow" onClick={()=>setPhrase(p=>p.slice(0,-1))}>Desfazer</button>
              <select value={ttsLang} onChange={e=>setTtsLang(e.target.value)} style={{padding:"6px 10px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"13px",cursor:"pointer"}}>
                <option value="pt-BR">🇧🇷 PT-BR</option>
                <option value="pt-PT">🇵🇹 PT-PT</option>
                <option value="en-US">🇺🇸 EN</option>
                <option value="es-ES">🇪🇸 ES</option>
                <option value="fr-FR">🇫🇷 FR</option>
                <option value="de-DE">🇩🇪 DE</option>
              </select>
              <select value={ttsGender} onChange={e=>setTtsGender(e.target.value)} title="Gênero da voz" style={{padding:"6px 8px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"13px",cursor:"pointer",background:"white"}}>
                <option value="NEUTRAL">🔊 Voz</option>
                <option value="FEMALE">👩 Feminina</option>
                <option value="MALE">👨 Masculina</option>
                <option value="CHILD">🧒 Infantil</option>
              </select>
              <button onClick={()=>setShowMobileTools(v=>!v)} style={{background:showMobileTools?"#071b2c":"#f3f4f6",color:showMobileTools?"#4ec9a0":"#374151",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>
                {showMobileTools ? "Menos opções" : "Mais opções"}
              </button>

              {showMobileTools && (
                <>
                  <button onClick={()=>setPhrase([])}>Limpar</button>
                  <button onClick={()=>setShowQuickFires(q=>!q)} style={{background:showQuickFires?"#7c3aed":"#ede9fe",color:showQuickFires?"white":"#7c3aed",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>
                    ⚡ QuickFires
                  </button>
                  <select value={dwellMs} onChange={e=>setDwellMs(Number(e.target.value))} title="Dwell time — seleção por tempo de toque" style={{padding:"6px 8px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"13px",cursor:"pointer",background:"white"}}>
                    <option value={0}>👆 Toque</option>
                    <option value={800}>⏱ 0.8s</option>
                    <option value={1500}>⏱ 1.5s</option>
                    <option value={2500}>⏱ 2.5s</option>
                    <option value={4000}>⏱ 4.0s</option>
                  </select>
                  <button onClick={()=>setDarkMode(d=>!d)} title="Alternar modo escuro" style={{background:darkMode?"#4ec9a0":"#f3f4f6",color:darkMode?"#0d1117":"#374151",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"15px",cursor:"pointer"}}>
                    {darkMode?"☀️":"🌙"}
                  </button>
                  <button onClick={()=>setShowAccessibility(true)} title="Acessibilidade adaptativa"
                    style={{background:diagnostico!=="padrao"?"#071b2c":"#f3f4f6",color:diagnostico!=="padrao"?"#4ec9a0":"#374151",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"15px",cursor:"pointer",fontWeight:diagnostico!=="padrao"?"700":"400"}}>
                    ♿{diagnostico!=="padrao"?` ${DIAGNOSTICO_PROFILES[diagnostico]?.icon}`:""}
                  </button>
                  <button onClick={async()=>{
                    const res = await fetch("/api/export-board",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cards:cards.filter(c=>!c.empty),title:patientName||"Prancha CAA",cols:5})});
                    const html = await res.text();
                    const w = window.open("","_blank");
                    w.document.write(html);
                    w.document.close();
                  }} style={{background:"#eff6ff",color:"#2563eb",border:"none",borderRadius:"8px",padding:"6px 12px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}}>
                    🖨️ Imprimir
                  </button>
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
                </>
              )}
            </div>
          </section>

          {isMobile ? (
            <section className="caa-mobile-filters caa-mobile-filters-inline">
              <div className="caa-mobile-filter">
                <label>Categoria</label>
                <select value={category} onChange={e=>setCategory(e.target.value)}>
                  <option value="all">Todos</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
            </section>
          ) : (
            <section className="caa-category-row">
              <button onClick={()=>setCategory("all")} className={category==="all"?"active":""}>Todos</button>
              {categories.map(cat=>(
                <button key={cat.id} onClick={()=>setCategory(cat.id)} className={category===cat.id?"active":""}>{cat.label}</button>
              ))}
            </section>
          )}

          <section className="caa-board">
            {shownCards.map(card=>(
              <article key={card.id} className={`caa-card cat-${card.cat} ${editing?.id===card.id?"active":""}`}>
                <div className="caa-card-inner">
                  <button className="caa-card-button" onClick={()=>selectCard(card)} style={{padding:a11yConfig.touchTolerance>0?`${a11yConfig.touchTolerance/4}px`:undefined}}>
                    <div className="caa-image-frame" style={{filter:contrastFilter}}>
                      {card.image ? <img src={card.image} alt={card.label} /> : <div className="caa-empty">+</div>}
                    </div>
                    <div className="caa-label" style={{fontSize:`${20*fontScale}px`,textTransform:"uppercase"}}>{(card.label || "").toUpperCase()}</div>
                  </button>
                  {editMode && (
                    <div className="caa-tools">
                      <button onClick={(e)=>{e.stopPropagation(); setEditing(card);}}>Editar</button>
                      <button onClick={(e)=>{e.stopPropagation(); downloadImage(card);}}>Baixar</button>
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
              <button onClick={()=>{
                setPickerTab("buscar");
                openImagePicker();
              }}>🔍 Trocar imagem</button>
              <button onClick={()=>downloadImage(editing)}>Baixar imagem</button>
              <button className="green" onClick={saveEditing}>Salvar alterações</button>
              <button onClick={()=>setEditing(null)}>Cancelar</button>
            </>
          ) : (
            <p>Selecione um card para editar nome, categoria e imagem.</p>
          )}
        </aside>

        {editing && (
          <div onClick={()=>setEditing(null)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:"white",borderRadius:"20px",padding:"24px",width:"100%",maxWidth:"420px",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                <h2 style={{margin:0,fontSize:"18px",fontWeight:"800",color:"#071b2c"}}>Editar card</h2>
                <button onClick={()=>setEditing(null)}
                  style={{background:"#f3f4f6",border:"none",width:"32px",height:"32px",borderRadius:"50%",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>

              {/* Preview da imagem */}
              <div style={{display:"flex",justifyContent:"center",marginBottom:"20px"}}>
                <div style={{width:"100px",height:"100px",borderRadius:"16px",border:"2px dashed #e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"#f9fafb",cursor:"pointer"}}
                  onClick={()=>{setPickerTab("buscar");openImagePicker();}}>
                  {editing.image
                    ? <img src={editing.image} alt={editing.label} style={{width:"100%",height:"100%",objectFit:"contain"}} />
                    : <span style={{fontSize:"32px",color:"#9ca3af"}}>🖼️</span>}
                </div>
              </div>

              {/* Campos */}
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <div>
                  <label style={{fontSize:"12px",fontWeight:"700",color:"#374151",display:"block",marginBottom:"5px"}}>Nome do card</label>
                  <input value={editing.label}
                    onChange={e=>setEditing({...editing,label:e.target.value})}
                    style={{width:"100%",padding:"10px 12px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px",fontFamily:"inherit",boxSizing:"border-box"}} />
                </div>
                <div>
                  <label style={{fontSize:"12px",fontWeight:"700",color:"#374151",display:"block",marginBottom:"5px"}}>Categoria</label>
                  <select value={editing.cat}
                    onChange={e=>setEditing({...editing,cat:e.target.value})}
                    style={{width:"100%",padding:"10px 12px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px",background:"white"}}>
                    {categories.map(cat=><option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>
              </div>

              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>uploadImageToLibrary(e.target.files?.[0])} />

              {/* Ações */}
              <div style={{display:"flex",flexDirection:"column",gap:"8px",marginTop:"20px"}}>
                <button onClick={()=>{setPickerTab("buscar");openImagePicker();}}
                  style={{width:"100%",padding:"11px",background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>
                  🔍 Trocar imagem
                </button>
                <button onClick={saveEditing}
                  style={{width:"100%",padding:"11px",background:"#00885f",color:"white",border:"none",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>
                  ✅ Salvar alterações
                </button>
                <button onClick={()=>setEditing(null)}
                  style={{width:"100%",padding:"11px",background:"white",color:"#374151",border:"1px solid #e5e7eb",borderRadius:"10px",fontSize:"14px",cursor:"pointer"}}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>



      {/* Modal unificado: Buscar + Minhas imagens + Gerar com IA */}
      {imagePickerOpen && (
        <div className="imagePickerOverlay" onClick={()=>setImagePickerOpen(false)}>
          <div className="imagePickerModal" style={{maxWidth:"680px",width:"95%"}} onClick={e=>e.stopPropagation()}>
            <div className="imagePickerHeader">
              <div>
                <h2>Banco de imagens</h2>
                <p>Busque no banco de imagens da plataforma pelo nome do card ou gere com IA</p>
              </div>
              <button onClick={()=>setImagePickerOpen(false)} style={{fontSize:"24px",background:"none",border:"none",cursor:"pointer"}}>×</button>
            </div>

            {imagePickerError && (
              <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#b91c1c",borderRadius:"10px",padding:"10px 12px",fontSize:"13px",margin:"0 0 14px"}}>
                {imagePickerError}
              </div>
            )}

            {/* Tabs */}
            <div style={{display:"flex",gap:"4px",padding:"0 0 16px",borderBottom:"1px solid #e5e7eb",marginBottom:"16px"}}>
              {[["buscar","🔍 Buscar imagens"],["minhas","📁 Minhas imagens"],["gerar","✨ Gerar com IA"]].map(([id,label])=>(
                <button key={id} style={tabStyle(pickerTab===id)} onClick={()=>setPickerTab(id)}>{label}</button>
              ))}
            </div>

            {/* Tab: Buscar em todas as bibliotecas */}
            {pickerTab==="buscar" && (
              <div>
                <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
                  <select
                    value={searchSource}
                    onChange={e=>setSearchSource(e.target.value)}
                    style={{padding:"10px 12px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px",background:"white"}}
                  >
                    <option value="all">Todas as bibliotecas</option>
                    <option value="arasaac">ARASAAC</option>
                    <option value="mulberry">Mulberry</option>
                    <option value="sclera">Sclera</option>
                    <option value="symbotalk">SymboTalk</option>
                  </select>
                  <input
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&searchPictogramas(searchQuery, searchSource)}
                    placeholder="Ex: água, comer, feliz, escola..."
                    style={{flex:1,minWidth:"220px",padding:"10px 12px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px"}}
                  />
                  <button
                    onClick={()=>searchPictogramas(searchQuery, searchSource)}
                    disabled={searchLoading}
                    style={{padding:"10px 20px",background:"#2563eb",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"14px"}}
                  >
                    {searchLoading?"...":"Buscar"}
                  </button>
                </div>
                {searchLoading && <p style={{textAlign:"center",color:"#6b7280",fontSize:"13px"}}>Buscando imagens em todas as bibliotecas...</p>}
                {!searchLoading && searchResults.length===0 && searchQuery && (
                  <p style={{textAlign:"center",color:"#9ca3af",fontSize:"13px"}}>Nenhum resultado. Tente outra palavra.</p>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:"8px",maxHeight:"380px",overflowY:"auto"}}>
                  {searchResults.map(item=>(
                    <button key={item.id} onClick={()=>chooseImage(item.url, item.label)}
                      style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",transition:"border-color 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#2563eb"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#e5e7eb"}
                    >
                      <img src={item.url} alt={item.label} style={{width:"64px",height:"64px",objectFit:"contain"}} />
                      <span style={{fontSize:"11px",color:"#374151",textAlign:"center",lineHeight:"1.3",textTransform:"uppercase"}}>{(item.label || "").toUpperCase()}</span>
                      <span style={{fontSize:"10px",fontWeight:"700",color:item.source_color || "#6b7280",background:"#f8fafc",border:"1px solid #e5e7eb",borderRadius:"999px",padding:"2px 8px"}}>
                        {item.source || "Biblioteca"}
                      </span>
                    </button>
                  ))}
                </div>
                <p style={{fontSize:"11px",color:"#9ca3af",marginTop:"12px",textAlign:"center"}}>
                  Resultados de ARASAAC, Mulberry, Sclera e SymboTalk
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

            {/* Tab: Gerar com IA — Hook Story Offer */}
            {pickerTab==="gerar" && (
              <div>
                {/* HOOK */}
                <div style={{textAlign:"center",padding:"8px 0 20px"}}>
                  <div style={{fontSize:"32px",marginBottom:"8px"}}>✨</div>
                  <h3 style={{fontSize:"18px",fontWeight:"900",color:"#1e0a3c",margin:"0 0 6px"}}>
                    E se você pudesse criar o pictograma exato que seu paciente precisa?
                  </h3>
                  <p style={{fontSize:"13px",color:"#6b7280",margin:0,lineHeight:"1.6"}}>
                    Sem depender de bancos genéricos. Sem adaptar o que existe. <strong>Do zero, em segundos.</strong>
                  </p>
                </div>

                {/* STORY */}
                <div style={{background:"#faf5ff",border:"1px solid #e9d5ff",borderRadius:"12px",padding:"16px",marginBottom:"16px"}}>
                  <p style={{fontSize:"13px",color:"#4c1d95",margin:"0 0 10px",lineHeight:"1.7"}}>
                    <strong>Fonoaudiólogos nos contam:</strong> "Meu paciente tem uma rotina específica — a terapia dele, o lanche dele, o remédio com o nome certo. Nunca encontro um pictograma exato para isso."
                  </p>
                  <p style={{fontSize:"13px",color:"#4c1d95",margin:0,lineHeight:"1.7"}}>
                    Com geração por IA, você digita <em>"criança tomando Ritalina de manhã"</em> ou <em>"cadeira de rodas verde, vista de frente"</em> — e a imagem é criada exclusivamente para aquele paciente.
                  </p>
                </div>

                {/* OFFER — cores verdes do app */}
                <div style={{background:"linear-gradient(135deg,#062f1b,#00885f)",borderRadius:"14px",padding:"20px",marginBottom:"16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                    <span style={{background:"rgba(255,255,255,0.2)",borderRadius:"20px",padding:"3px 12px",fontSize:"11px",fontWeight:"700",color:"white"}}>PLANO PRO</span>
                    <span style={{fontSize:"12px",color:"rgba(255,255,255,0.7)"}}>R$ 35/mês · cancele quando quiser</span>
                  </div>
                  <label style={{fontSize:"13px",fontWeight:"700",color:"white",display:"block",marginBottom:"8px"}}>
                    Descreva o pictograma que você precisa:
                  </label>
                  <input
                    value={generatePrompt}
                    onChange={e=>setGeneratePrompt(e.target.value)}
                    placeholder={`Ex: "${editing?.label||"criança bebendo água"}" estilo pictograma simples`}
                    onKeyDown={e=>e.key==="Enter"&&generateImage()}
                    style={{width:"100%",padding:"12px 14px",borderRadius:"10px",border:"2px solid rgba(255,255,255,0.3)",fontSize:"14px",marginBottom:"12px",boxSizing:"border-box",background:"rgba(255,255,255,0.1)",color:"white",outline:"none"}}
                  />
                  {generateError && (
                    <div style={{background:"rgba(0,0,0,0.3)",borderRadius:"8px",padding:"10px",marginBottom:"12px",fontSize:"12px",color:"#fca5a5",lineHeight:"1.5"}}>
                      {generateError}
                      {generateError.includes("Pro") && (
                        <a href="/planos" style={{display:"block",marginTop:"6px",color:"#4ec9a0",fontWeight:"700",fontSize:"13px"}}>
                          → Assinar Pro por R$ 35/mês e desbloquear agora
                        </a>
                      )}
                    </div>
                  )}
                  <button
                    onClick={generateImage}
                    disabled={generating||!generatePrompt.trim()}
                    style={{width:"100%",padding:"14px",background:generating?"rgba(255,255,255,0.3)":"white",color:generating?"white":"#062f1b",border:"none",borderRadius:"10px",fontWeight:"900",cursor:generating?"wait":"pointer",fontSize:"15px",transition:"all 0.2s",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}
                  >
                    {generating?"⏳ Gerando sua imagem...":"✨ Gerar pictograma exclusivo"}
                  </button>
                  <p style={{fontSize:"11px",color:"rgba(255,255,255,0.6)",marginTop:"8px",textAlign:"center"}}>
                    Powered by fal.ai · Gerado em 3–8 segundos · Imagem exclusiva sua
                  </p>
                </div>

                {/* Comparação plano */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  <div style={{background:"#f9fafb",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:"20px",marginBottom:"4px"}}>🆓</div>
                    <div style={{fontSize:"12px",fontWeight:"700",color:"#374151",marginBottom:"4px"}}>Plano Gratuito</div>
                    <div style={{fontSize:"11px",color:"#6b7280",lineHeight:"1.5"}}>45.000+ pictogramas ARASAAC. Busque na aba ao lado.</div>
                  </div>
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:"20px",marginBottom:"4px"}}>⭐</div>
                    <div style={{fontSize:"12px",fontWeight:"700",color:"#00885f",marginBottom:"4px"}}>Plano Pro</div>
                    <div style={{fontSize:"11px",color:"#6b7280",lineHeight:"1.5"}}>Crie qualquer pictograma com IA. Exclusivo, personalizado, seu.</div>
                  </div>
                </div>
                <div style={{textAlign:"center",marginTop:"12px"}}>
                  <a href="/planos" style={{fontSize:"13px",color:"#00885f",fontWeight:"700",textDecoration:"none"}}>
                    Ver planos e assinar Pro →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    <Onboarding />
      {showAccessibility && (
        <AccessibilityPanel
          diagnostico={diagnostico}
          setDiagnostico={setDiagnostico}
          config={{...a11yConfig, ...a11yOverrides}}
          overrides={a11yOverrides}
          setOverrides={setA11yOverrides}
          onClose={()=>setShowAccessibility(false)}
        />
      )}
      <nav className="caa-mobile-bottomnav">
        <button className={mobileTab==="prancha"?"active":""} onClick={()=>setMobileTab("prancha")}>🏠<span>Prancha</span></button>
        <button className={mobileTab==="pacientes"?"active":""} onClick={()=>window.location.href="/pacientes"}>👥<span>Pacientes</span></button>
        <button className={mobileTab==="agenda"?"active":""} onClick={()=>window.location.href="/pacientes"}>📅<span>Agenda</span></button>
        <button className={mobileTab==="biblioteca"?"active":""} onClick={()=>window.location.href="/biblioteca"}>📚<span>Biblioteca</span></button>
        <button className={mobileTab==="ajuda"?"active":""} onClick={()=>window.location.href="/suporte"}>❓<span>Ajuda</span></button>
      </nav>

    </main>
    </AppShell>
  );
}
