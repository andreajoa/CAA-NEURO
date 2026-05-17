"use client";

import { useEffect, useRef, useState } from "react";

const initialCards = [
  { id:"sim",label:"Sim",image:"/cards/level-1/sim.png",cat:"basic" },
  { id:"nao",label:"Não",image:"/cards/level-1/nao.png",cat:"basic" },
  { id:"me-da",label:"Me dá",image:"/cards/level-1/me-da.png",cat:"basic" },
  { id:"nao-quero",label:"Não quero",image:"/cards/level-1/nao-quero.png",cat:"basic" },
  { id:"mais",label:"Mais",image:"/cards/level-1/mais.png",cat:"control" },
  { id:"acabou",label:"Acabou",image:"/cards/level-1/acabou.png",cat:"control" },
  { id:"ajuda",label:"Ajuda",image:"/cards/level-1/ajuda.png",cat:"basic" },
  { id:"agua",label:"Água",image:"/cards/level-1/agua.png",cat:"need" },
  { id:"comer",label:"Comer",image:"/cards/level-1/comer.png",cat:"need" },
  { id:"banheiro",label:"Banheiro",image:"/cards/level-1/banheiro.png",cat:"need" },
  { id:"dormir",label:"Dormir",image:"/cards/level-1/dormir.png",cat:"need" },
  { id:"dor",label:"Dor",image:"/cards/level-1/dor.png",cat:"need" },
  { id:"tomar-banho",label:"Tomar banho",image:"/cards/level-1/tomar-banho.png",cat:"action" },
  { id:"remedio",label:"Remédio",image:"/cards/level-1/remedio.png",cat:"basic" },
  { id:"feliz",label:"Feliz",image:"/cards/level-1/feliz.png",cat:"emotion" },
  { id:"triste",label:"Triste",image:"/cards/level-1/triste.png",cat:"emotion" },
  { id:"bravo",label:"Bravo",image:"/cards/level-1/bravo.png",cat:"emotion" },
  { id:"medo",label:"Medo",image:"/cards/level-1/medo.png",cat:"emotion" },
  { id:"cansado",label:"Cansado",image:"/cards/level-1/cansado.png",cat:"action" },
  { id:"brincar",label:"Brincar",image:"/cards/level-1/brincar.png",cat:"action" },
  { id:"parar",label:"Parar",image:"/cards/level-1/parar.png",cat:"basic" },
  { id:"sair",label:"Sair",image:"/cards/level-1/sair.png",cat:"need" },
  { id:"passear",label:"Passear",image:"/cards/level-1/passear.png",cat:"action" },
  { id:"escola",label:"Escola",image:"/cards/level-1/escola.png",cat:"place" },
];

export default function Home() {
  const [cards,setCards] = useState(initialCards);
  const [phrase,setPhrase] = useState(["Eu","quero","água","por","favor"]);
  const [editMode,setEditMode] = useState(false);
  const [editing,setEditing] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("caa-level-1-cards");
    if (saved) setCards(JSON.parse(saved));
  }, []);

  function persist(next){
    setCards(next);
    localStorage.setItem("caa-level-1-cards", JSON.stringify(next));
  }

  function speak(text){
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    u.rate = .88;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function selectCard(card){
    setPhrase(p => [...p, card.label]);
    setEditing(card);
    speak(card.label);
  }

  function saveEditing(){
    persist(cards.map(c => c.id === editing.id ? editing : c));
    setEditing(null);
  }

  async function replaceImage(file){
    if(!file || !editing) return;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffe8f1";
    ctx.fillRect(0,0,1200,1200);
    const size = Math.min(img.width,img.height);
    const sx = (img.width-size)/2;
    const sy = (img.height-size)/2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img,sx,sy,size,size,0,0,1200,1200);
    setEditing({...editing,image:canvas.toDataURL("image/png")});
  }

  function downloadImage(card){
    const a = document.createElement("a");
    a.href = card.image;
    a.download = `${card.id}.png`;
    a.click();
  }

  function addCard(){
    const card = {id:crypto.randomUUID(),label:"Novo card",image:"/cards/level-1/mais.png",cat:"basic"};
    persist([...cards, card]);
    setEditing(card);
    setEditMode(true);
  }

  function reset(){
    localStorage.removeItem("caa-level-1-cards");
    setCards(initialCards);
    setPhrase(["Eu","quero","água","por","favor"]);
  }

  return (
    <main className={`page ${editMode ? "editing" : ""}`}>
      <section className="top">
        <div className="brand">
          <div className="level">Nível 1</div>
          <h1>CAA Neuro</h1>
          <div className="subtitle">Prancha de Comunicação Aumentativa e Alternativa</div>
        </div>
        <div className="topBtns">
          <button className="pill green">👤 Modo: Usuário</button>
          <button className="pill" onClick={() => setEditMode(!editMode)}>✎ {editMode ? "Sair da edição" : "Editar cartões"}</button>
          <button className="pill pink" onClick={reset}>↻ Resetar prancha</button>
        </div>
      </section>

      <section className="mainLayout">
        <div>
          <section className="phrase">
            <div className="phraseTitle">Frase atual</div>
            <div className="words">
              {phrase.map((w,i)=><span className="word" key={i}>{w}</span>)}
              <button className="addWord" onClick={() => setPhrase([...phrase,""])}>+</button>
            </div>
            <div className="actions">
              <button className="btn green" onClick={() => speak(phrase.join(" "))}>🔊 Falar frase</button>
              <button className="btn white" onClick={() => setPhrase([])}>⌫ Limpar</button>
              <button className="btn yellow" onClick={() => setPhrase(p => p.slice(0,-1))}>↶ Desfazer</button>
              <button className="btn dark" onClick={addCard}>+ Novo card</button>
            </div>
          </section>

          <section className="board">
            <div className="grid">
              {cards.map(card => (
                <article className={`card cat-${card.cat} ${editing?.id === card.id ? "active" : ""}`} key={card.id}>
                  <div className="cardInner">
                    <button onClick={() => selectCard(card)} style={{background:"transparent",width:"100%",padding:0}}>
                      <div className="imgBox"><img src={card.image} alt={card.label}/></div>
                      <div className="label">{card.label}</div>
                    </button>
                    <div className="cardTools">
                      <button className="smallBtn" onClick={() => setEditing(card)}>Editar</button>
                      <button className="smallBtn" onClick={() => downloadImage(card)}>Baixar imagem</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <div className="hint">🔊 Toque em qualquer card para ouvir a palavra/frase</div>
        </div>

        <aside className="side">
          <button className="close" onClick={() => setEditing(null)}>×</button>
          <h2>Editar card</h2>
          {editing ? (
            <>
              <div className="preview"><div className="previewInner"><img src={editing.image} alt={editing.label}/></div></div>
              <div className="field">Nome do card</div>
              <input className="input" value={editing.label} onChange={e => setEditing({...editing,label:e.target.value})}/>
              <div className="field">Imagem do card</div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => replaceImage(e.target.files?.[0])}/>
              <div className="sideActions">
                <button className="btn white" onClick={() => fileRef.current?.click()}>✎ Trocar imagem</button>
                <button className="btn white" onClick={() => downloadImage(editing)}>⇩ Baixar imagem</button>
                <button className="btn green" onClick={saveEditing}>▣ Salvar alterações</button>
                <button className="btn white" onClick={() => setEditing(null)}>← Cancelar</button>
              </div>
            </>
          ) : <p>Selecione um card para editar.</p>}
        </aside>
      </section>

      <section className="infoGrid">
        <div className="info"><h3>Como usar</h3><p><b>1.</b> Toque nos cards para montar sua frase.<br/><b>2.</b> Clique em Falar frase.<br/><b>3.</b> Edite nomes e imagens.</p></div>
        <div className="info"><h3>Cores por categoria</h3><p><span className="dot" style={{background:"#f04494"}}/>Básico / Respostas</p><p><span className="dot" style={{background:"#ff9f2d"}}/>Necessidades</p><p><span className="dot" style={{background:"#4fc667"}}/>Ações</p><p><span className="dot" style={{background:"#4b95ff"}}/>Emoções</p></div>
        <div className="info"><h3>Funcionalidades</h3><ul><li>Fala ao tocar no card</li><li>Monta frases</li><li>Troca imagem</li><li>Baixa imagem</li><li>Salva no navegador</li></ul></div>
        <div className="info"><h3>Dica de uso</h3><p>Personalize a prancha com palavras e imagens que façam sentido para o usuário.</p></div>
      </section>
    </main>
  );
}
