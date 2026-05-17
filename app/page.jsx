"use client";

import { useEffect, useRef, useState } from "react";

const initialCards = [
  { id: "sim", label: "Sim", image: "/cards/level-1/sim.png" },
  { id: "nao", label: "Não", image: "/cards/level-1/nao.png" },
  { id: "me-da", label: "Me dá", image: "/cards/level-1/me-da.png" },
  { id: "nao-quero", label: "Não quero", image: "/cards/level-1/nao-quero.png" },
  { id: "mais", label: "Mais", image: "/cards/level-1/mais.png" },
  { id: "acabou", label: "Acabou", image: "/cards/level-1/acabou.png" },
  { id: "ajuda", label: "Ajuda", image: "/cards/level-1/ajuda.png" },
  { id: "esperar", label: "Esperar", image: "/cards/level-1/esperar.png" },
  { id: "agua", label: "Água", image: "/cards/level-1/agua.png" },
  { id: "comer", label: "Comer", image: "/cards/level-1/comer.png" },
  { id: "banheiro", label: "Banheiro", image: "/cards/level-1/banheiro.png" },
  { id: "dor", label: "Dor", image: "/cards/level-1/dor.png" },
  { id: "dormir", label: "Dormir", image: "/cards/level-1/dormir.png" },
  { id: "tomar-banho", label: "Tomar banho", image: "/cards/level-1/tomar-banho.png" },
  { id: "remedio", label: "Remédio", image: "/cards/level-1/remedio.png" },
  { id: "feliz", label: "Feliz", image: "/cards/level-1/feliz.png" },
  { id: "triste", label: "Triste", image: "/cards/level-1/triste.png" },
  { id: "bravo", label: "Bravo", image: "/cards/level-1/bravo.png" },
  { id: "medo", label: "Medo", image: "/cards/level-1/medo.png" },
  { id: "cansado", label: "Cansado", image: "/cards/level-1/cansado.png" },
  { id: "brincar", label: "Brincar", image: "/cards/level-1/brincar.png" },
  { id: "parar", label: "Parar", image: "/cards/level-1/parar.png" },
  { id: "sair", label: "Sair", image: "/cards/level-1/sair.png" },
  { id: "passear", label: "Passear", image: "/cards/level-1/passear.png" },
  { id: "escola", label: "Escola", image: "/cards/level-1/escola.png" },
];

export default function Home() {
  const [cards, setCards] = useState(initialCards);
  const [phrase, setPhrase] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("caa-level-1-cards");
    if (saved) setCards(JSON.parse(saved));
  }, []);

  function persist(next) {
    setHistory((old) => [cards, ...old].slice(0, 20));
    setCards(next);
    localStorage.setItem("caa-level-1-cards", JSON.stringify(next));
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.88;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function selectCard(card) {
    setPhrase((old) => [...old, card.label]);
    speak(card.label);
  }

  function undo() {
    const previous = history[0];
    if (!previous) return;
    setCards(previous);
    localStorage.setItem("caa-level-1-cards", JSON.stringify(previous));
    setHistory((old) => old.slice(1));
  }

  function updateEditing(patch) {
    setEditing((old) => ({ ...old, ...patch }));
  }

  function saveEditing() {
    persist(cards.map((card) => (card.id === editing.id ? editing : card)));
    setEditing(null);
  }

  async function replaceImage(file) {
    if (!file || !editing) return;

    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffe8f1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "contrast(1.05) saturate(1.05) brightness(1.02)";
    ctx.drawImage(img, sx, sy, size, size, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    updateEditing({ image: dataUrl });
  }

  function downloadImage(card) {
    const link = document.createElement("a");
    link.href = card.image;
    link.download = `${card.id}.png`;
    link.click();
  }

  function resetCards() {
    localStorage.removeItem("caa-level-1-cards");
    setCards(initialCards);
    setHistory([]);
  }

  return (
    <main className="page">
      <header className="header">
        <div className="">
          <div>
            <p className="phraseTitle">Nível 1</p>
            <h1 className="">CAA Neuro</h1>
            <p className="">
              Toque em um card para falar. Edite o nome, troque a imagem e personalize a prancha.
            </p>
          </div>

          <div className="topActions">
            <button onClick={() => setEditMode(!editMode)} className="btn white">
              {editMode ? "Sair da edição" : "Editar cards"}
            </button>
            <button onClick={resetCards} className="btn white">
              Resetar
            </button>
          </div>
        </div>
      </header>

      <section className="phraseBox">
        <div className="phraseWords">
          {phrase.map((word, index) => (
            <span key={`${word}-${index}`} className="word">
              {word}
            </span>
          ))}
        </div>

        <div className="actions">
          <button onClick={() => speak(phrase.join(" "))} className="btn green">
            Falar frase
          </button>
          <button onClick={() => setPhrase([])} className="btn yellow">
            Limpar
          </button>
          <button onClick={undo} className="btn white">
            Desfazer
          </button>
        </div>
      </section>

      <section className="board grid">
        {cards.map((card) => (
          <article key={card.id} className="card">
            <button onClick={() => selectCard(card)} className="">
              <div className="imageFrame">
                <img src={card.image} alt={card.label} className="" />
              </div>
              <div className="label">
                {card.label}
              </div>
            </button>

            {editMode && (
              <div className="cardTools">
                <button onClick={() => setEditing(card)} className="smallBtn">
                  Editar
                </button>
                <button onClick={() => downloadImage(card)} className="smallBtn">
                  Baixar imagem
                </button>
              </div>
            )}
          </article>
        ))}
      </section>

      {editing && (
        <div className="modal">
          <div className="modalBox">
            <h2 className="">Editar card</h2>

            <div className="modalPreview">
              <img src={editing.image} alt={editing.label} className="" />
            </div>

            <label className="">Nome abaixo da imagem</label>
            <input
              value={editing.label}
              onChange={(e) => updateEditing({ label: e.target.value })}
              className="input"
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{display:"none"}}
              onChange={(e) => replaceImage(e.target.files?.[0])}
            />

            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileRef.current?.click()} className="btn white">
                Trocar imagem
              </button>
              <button onClick={saveEditing} className="btn green">
                Salvar
              </button>
              <button onClick={() => setEditing(null)} className="btn white">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
