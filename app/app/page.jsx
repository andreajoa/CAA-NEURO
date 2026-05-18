"use client";

import { useEffect, useRef, useState } from "react";

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
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imageLibrary, setImageLibrary] = useState({ platformImages: [], userImages: [] });
  const [imageLibraryLoading, setImageLibraryLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileRef = useRef(null);

  const patientPrefix = activePatientId || "sem-paciente";
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
    async function loadD1Data() {
      try {
        const [patientsRes, sessionsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/sessions"),
        ]);

        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data.patients || []);
        }

        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do D1:", error);
      }
    }

    loadD1Data();
  }, []);

  useEffect(() => {
    const res = await fetch(`/api/cards?profile=${profile}&level=${level}`);
const data = await res.json();

if (res.ok && data.cards?.length) {
  setCards(
    data.cards.map(card => ({
      id: card.id,
      label: card.label,
      image: card.image_url,
      cat: card.category
    }))
  );
} else {
  setCards(defaultBoard(profile, level));
}
    setEditing(null);
    setPhrase([]);
    setCategory("all");
  }, [profile, level, activePatientId]);

  async function persist(next) {
    setCards(next);

    try {
      await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, level, cards: next }),
      });
    } catch (error) {
      console.error("Erro ao salvar cards no D1:", error);
      alert("Não foi possível salvar os cards no banco.");
    }
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

  async function resetBoard() {
    const next = defaultBoard(profile, level);
    await persist(next);
    setEditing(null);
    setPhrase([]);
  }

  async function createPatient() {
    const name = patientName.trim();
    if (!name) return;

    const patient = {
      id: crypto.randomUUID(),
      name,
      age: "",
      notes: "",
    };

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar paciente");

      const next = [...patients, data.patient];
      setPatients(next);
      setActivePatientId(data.patient.id);
      setPatientName("");
    } catch (error) {
      console.error("Erro ao salvar paciente no D1:", error);
      alert("Não foi possível salvar o paciente.");
    }
  }

  async function saveSession() {
    const activePatient = patients.find((p) => p.id === activePatientId);

    const session = {
      id: crypto.randomUUID(),
      patient_id: activePatientId || "",
      patientName: activePatient?.name || "Sem paciente",
      profile,
      level,
      phrase: phrase.join(" "),
      note: sessionNote,
      createdAt: new Date().toLocaleString("pt-BR"),
    };

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar sessão");

      const next = [session, ...sessions].slice(0, 50);
      setSessions(next);
      setSessionNote("");
      alert("Sessão salva no banco.");
    } catch (error) {
      console.error("Erro ao salvar sessão no D1:", error);
      alert("Não foi possível salvar a sessão.");
    }
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

  async function openImagePicker() {
    setImagePickerOpen(true);
    setImageLibraryLoading(true);

    try {
      const res = await fetch("/api/images/library");
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Erro ao carregar biblioteca");

      setImageLibrary({
        platformImages: data.platformImages || [],
        userImages: data.userImages || [],
      });
    } catch (error) {
      alert("Não foi possível carregar o banco de imagens.");
      console.error(error);
    } finally {
      setImageLibraryLoading(false);
    }
  }

  function chooseImageFromLibrary(image) {
    if (!editing) return;

    setEditing({
      ...editing,
      image: image.url,
      empty: false,
    });

    setImagePickerOpen(false);
  }

  async function uploadImageToLibrary(file) {
    if (!file || !editing) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", editing.label || "Imagem do card");

    setImageLibraryLoading(true);

    try {
      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Erro no upload");

      setEditing({
        ...editing,
        image: data.url,
        empty: false,
      });

      const libraryRes = await fetch("/api/images/library");
      const libraryData = await libraryRes.json();

      setImageLibrary({
        platformImages: libraryData.platformImages || [],
        userImages: libraryData.userImages || [],
      });

      setImagePickerOpen(false);
    } catch (error) {
      alert("Não foi possível enviar a imagem.");
      console.error(error);
    } finally {
      setImageLibraryLoading(false);
    }
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

              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => uploadImageToLibrary(e.target.files?.[0])} />

              <button onClick={openImagePicker}>Trocar imagem</button>
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
    
      {imagePickerOpen && (
        <div className="imagePickerOverlay" onClick={() => setImagePickerOpen(false)}>
          <div className="imagePickerModal" onClick={(e) => e.stopPropagation()}>
            <div className="imagePickerHeader">
              <div>
                <h2>Banco de imagens</h2>
                <p>Escolha uma imagem já existente ou envie uma nova do celular/computador.</p>
              </div>
              <button onClick={() => setImagePickerOpen(false)}>×</button>
            </div>

            <div className="imagePickerUpload">
              <button onClick={() => fileRef.current?.click()}>
                Enviar imagem do dispositivo
              </button>
            </div>

            {imageLibraryLoading && <p className="imagePickerLoading">Carregando imagens...</p>}

            {!!imageLibrary.userImages.length && (
              <>
                <h3>Suas imagens salvas</h3>
                <div className="imagePickerGrid">
                  {imageLibrary.userImages.map((image) => (
                    <button key={image.id} onClick={() => chooseImageFromLibrary(image)}>
                      <img src={image.url} alt={image.label} />
                      <span>{image.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <h3>Banco de imagens da plataforma</h3>
            <div className="imagePickerGrid">
              {imageLibrary.platformImages.map((image) => (
                <button key={image.id} onClick={() => chooseImageFromLibrary(image)}>
                  <img src={image.url} alt={image.label} />
                  <span>{image.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
