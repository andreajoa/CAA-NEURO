"use client";

import { useEffect, useState } from "react";

const defaultCards = [
  { id: "1", text: "Eu quero", category: "Básico", image: "" },
  { id: "2", text: "Água", category: "Necessidades", image: "" },
  { id: "3", text: "Comer", category: "Necessidades", image: "" },
  { id: "4", text: "Banheiro", category: "Necessidades", image: "" },
  { id: "5", text: "Estou feliz", category: "Emoções", image: "" },
  { id: "6", text: "Estou triste", category: "Emoções", image: "" },
  { id: "7", text: "Ajuda", category: "Básico", image: "" },
  { id: "8", text: "Obrigado", category: "Básico", image: "" },
];

export default function Home() {
  const [cards, setCards] = useState(defaultCards);
  const [phrase, setPhrase] = useState([]);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("caa-neuro-cards");
    if (saved) setCards(JSON.parse(saved));
  }, []);

  function saveCards(next) {
    setHistory((h) => [cards, ...h].slice(0, 20));
    setCards(next);
    localStorage.setItem("caa-neuro-cards", JSON.stringify(next));
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  function clickCard(card) {
    setPhrase((p) => [...p, card.text]);
    speak(card.text);
  }

  function undo() {
    const previous = history[0];
    if (!previous) return;
    setCards(previous);
    setHistory((h) => h.slice(1));
    localStorage.setItem("caa-neuro-cards", JSON.stringify(previous));
  }

  async function imageToDataUrl(file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 900, 900);

    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "contrast(1.08) saturate(1.08) brightness(1.03)";
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 900, 900);

    return canvas.toDataURL("image/jpeg", 0.9);
  }

  function addCard() {
    saveCards([
      ...cards,
      {
        id: crypto.randomUUID(),
        text: "Novo card",
        category: "Personalizado",
        image: "",
      },
    ]);
  }

  function updateCard(card) {
    saveCards(cards.map((c) => (c.id === card.id ? card : c)));
    setEditing(null);
  }

  function deleteCard(card) {
    saveCards(cards.filter((c) => c.id !== card.id));
    setEditing(null);
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[#f7faf8]">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-green-950">CAA Neuro</h1>
          <p className="text-gray-600 text-lg">
            Prancha CAA personalizada com voz em português brasileiro.
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-green-100 text-green-900 font-bold">
          Demo
        </div>
      </header>

      <section className="sticky top-0 z-10 bg-white border rounded-3xl p-4 mb-6 shadow">
        <div className="flex gap-2 flex-wrap mb-3 min-h-12">
          {phrase.map((word, i) => (
            <span key={i} className="px-4 py-2 rounded-full bg-green-100 font-bold">
              {word}
            </span>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => speak(phrase.join(" "))} className="bg-green-700 text-white px-5 py-3 rounded-2xl font-bold">
            Falar frase
          </button>
          <button onClick={() => setPhrase([])} className="bg-gray-200 px-5 py-3 rounded-2xl font-bold">
            Limpar
          </button>
          <button onClick={undo} className="bg-yellow-100 px-5 py-3 rounded-2xl font-bold">
            ↩ Desfazer
          </button>
          <button onClick={addCard} className="bg-black text-white px-5 py-3 rounded-2xl font-bold">
            + Novo card
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <article key={card.id} className="bg-white border-4 border-green-100 rounded-3xl overflow-hidden shadow">
            <button onClick={() => clickCard(card)} className="w-full">
              {card.image ? (
                <img src={card.image} alt={card.text} className="card-img" />
              ) : (
                <div className="h-[150px] flex items-center justify-center bg-green-50 text-5xl">
                  🗣️
                </div>
              )}

              <div className="p-4">
                <h2 className="text-xl font-black">{card.text}</h2>
                <p className="text-sm text-gray-500">{card.category}</p>
              </div>
            </button>

            <button onClick={() => setEditing(card)} className="w-full border-t p-3 font-bold text-green-800">
              Editar
            </button>
          </article>
        ))}
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-black mb-4">Editar card</h2>

            <label className="font-bold">Nome do card</label>
            <input className="w-full border rounded-xl p-3 mb-4" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />

            <label className="font-bold">Categoria</label>
            <input className="w-full border rounded-xl p-3 mb-4" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />

            <label className="font-bold">Imagem do card</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-xl p-3 mb-4"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const image = await imageToDataUrl(file);
                setEditing({ ...editing, image });
              }}
            />

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => updateCard(editing)} className="bg-green-700 text-white px-5 py-3 rounded-2xl font-bold">
                Salvar
              </button>
              <button onClick={() => setEditing(null)} className="bg-gray-200 px-5 py-3 rounded-2xl font-bold">
                Voltar
              </button>
              <button onClick={() => deleteCard(editing)} className="bg-red-100 text-red-700 px-5 py-3 rounded-2xl font-bold">
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
