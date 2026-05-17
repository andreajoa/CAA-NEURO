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
    <main className="min-h-screen bg-[#f7f7f7] p-3 sm:p-5 lg:p-8">
      <header className="mx-auto max-w-7xl rounded-[28px] border-4 border-black bg-white p-5 shadow-[8px_8px_0_#111]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">Nível 1</p>
            <h1 className="text-4xl font-black text-black md:text-6xl">CAA Neuro</h1>
            <p className="mt-2 max-w-2xl text-base font-semibold text-gray-700 md:text-lg">
              Toque em um card para falar. Edite o nome, troque a imagem e personalize a prancha.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditMode(!editMode)} className="rounded-2xl border-4 border-black bg-pink-400 px-5 py-3 font-black text-black shadow-[4px_4px_0_#111]">
              {editMode ? "Sair da edição" : "Editar cards"}
            </button>
            <button onClick={resetCards} className="rounded-2xl border-4 border-black bg-white px-5 py-3 font-black text-black shadow-[4px_4px_0_#111]">
              Resetar
            </button>
          </div>
        </div>
      </header>

      <section className="sticky top-3 z-20 mx-auto mt-5 max-w-7xl rounded-[28px] border-4 border-black bg-white p-4 shadow-[8px_8px_0_#111]">
        <div className="mb-3 flex min-h-[48px] flex-wrap gap-2">
          {phrase.map((word, index) => (
            <span key={`${word}-${index}`} className="rounded-full border-2 border-black bg-pink-100 px-4 py-2 text-lg font-black">
              {word}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => speak(phrase.join(" "))} className="rounded-2xl border-4 border-black bg-green-300 px-5 py-3 font-black shadow-[4px_4px_0_#111]">
            Falar frase
          </button>
          <button onClick={() => setPhrase([])} className="rounded-2xl border-4 border-black bg-yellow-200 px-5 py-3 font-black shadow-[4px_4px_0_#111]">
            Limpar
          </button>
          <button onClick={undo} className="rounded-2xl border-4 border-black bg-blue-200 px-5 py-3 font-black shadow-[4px_4px_0_#111]">
            Desfazer
          </button>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <article key={card.id} className="rounded-[26px] border-4 border-black bg-white p-2 shadow-[6px_6px_0_#111] transition hover:-translate-y-1">
            <button onClick={() => selectCard(card)} className="block w-full">
              <div className="aspect-square overflow-hidden rounded-[20px] border-4 border-pink-400 bg-pink-50">
                <img src={card.image} alt={card.label} className="h-full w-full object-cover" />
              </div>
              <div className="px-2 py-3 text-center text-xl font-black text-black md:text-2xl">
                {card.label}
              </div>
            </button>

            {editMode && (
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => setEditing(card)} className="rounded-xl border-2 border-black bg-pink-100 py-2 text-sm font-black">
                  Editar
                </button>
                <button onClick={() => downloadImage(card)} className="rounded-xl border-2 border-black bg-gray-100 py-2 text-sm font-black">
                  Baixar imagem
                </button>
              </div>
            )}
          </article>
        ))}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-[28px] border-4 border-black bg-white p-5 shadow-[8px_8px_0_#111]">
            <h2 className="mb-4 text-3xl font-black">Editar card</h2>

            <div className="mb-4 aspect-square overflow-hidden rounded-[24px] border-4 border-pink-400 bg-pink-50">
              <img src={editing.image} alt={editing.label} className="h-full w-full object-cover" />
            </div>

            <label className="mb-1 block font-black">Nome abaixo da imagem</label>
            <input
              value={editing.label}
              onChange={(e) => updateEditing({ label: e.target.value })}
              className="mb-4 w-full rounded-2xl border-4 border-black p-3 text-xl font-black outline-none"
            />

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => replaceImage(e.target.files?.[0])}
            />

            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileRef.current?.click()} className="rounded-2xl border-4 border-black bg-blue-200 px-4 py-3 font-black shadow-[4px_4px_0_#111]">
                Trocar imagem
              </button>
              <button onClick={saveEditing} className="rounded-2xl border-4 border-black bg-green-300 px-4 py-3 font-black shadow-[4px_4px_0_#111]">
                Salvar
              </button>
              <button onClick={() => setEditing(null)} className="rounded-2xl border-4 border-black bg-gray-100 px-4 py-3 font-black shadow-[4px_4px_0_#111]">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
