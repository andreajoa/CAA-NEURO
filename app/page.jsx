"use client";

import { useEffect, useRef, useState } from "react";

const initialCards = [
  ["sim","Sim","sim.png","basic"],["nao","Não","nao.png","basic"],["me-da","Me dá","me-da.png","basic"],["nao-quero","Não quero","nao-quero.png","basic"],["mais","Mais","mais.png","control"],
  ["acabou","Acabou","acabou.png","control"],["ajuda","Ajuda","ajuda.png","basic"],["agua","Água","agua.png","need"],["comer","Comer","comer.png","need"],["banheiro","Banheiro","banheiro.png","need"],
  ["dormir","Dormir","dormir.png","need"],["dor","Dor","dor.png","need"],["tomar-banho","Tomar banho","tomar-banho.png","action"],["remedio","Remédio","remedio.png","basic"],["feliz","Feliz","feliz.png","emotion"],
  ["triste","Triste","triste.png","emotion"],["bravo","Bravo","bravo.png","emotion"],["medo","Medo","medo.png","emotion"],["cansado","Cansado","cansado.png","action"],["brincar","Brincar","brincar.png","action"],
  ["parar","Parar","parar.png","basic"],["sair","Sair","sair.png","need"],["passear","Passear","passear.png","action"],["escola","Escola","escola.png","place"]
].map(([id,label,file,cat])=>({id,label,image:`/cards/level-1/${file}`,cat}));

export default function Home(){
  const [cards,setCards]=useState(initialCards);
  const [phrase,setPhrase]=useState(["Eu","quero","água","por","favor"]);
  const [editMode,setEditMode]=useState(false);
  const [editing,setEditing]=useState(null);
  const fileRef=useRef(null);

  useEffect(()=>{const s=localStorage.getItem("caa-level-1-cards");if(s)setCards(JSON.parse(s))},[]);
  function persist(next){setCards(next);localStorage.setItem("caa-level-1-cards",JSON.stringify(next))}
  function speak(text){const u=new SpeechSynthesisUtterance(text);u.lang="pt-BR";u.rate=.88;speechSynthesis.cancel();speechSynthesis.speak(u)}
  function selectCard(card){setPhrase(p=>[...p,card.label]);setEditing(card);speak(card.label)}
  function saveEditing(){persist(cards.map(c=>c.id===editing.id?editing:c));setEditing(null)}
  async function replaceImage(file){
    if(!file||!editing)return;
    const img=document.createElement("img");img.src=URL.createObjectURL(file);await img.decode();
    const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=1200;
    const ctx=canvas.getContext("2d");ctx.fillStyle="#ffe8f1";ctx.fillRect(0,0,1200,1200);
    const size=Math.min(img.width,img.height),sx=(img.width-size)/2,sy=(img.height-size)/2;
    ctx.drawImage(img,sx,sy,size,size,0,0,1200,1200);
    setEditing({...editing,image:canvas.toDataURL("image/png")});
  }
  function downloadImage(card){const a=document.createElement("a");a.href=card.image;a.download=`${card.id}.png`;a.click()}
  function reset(){localStorage.removeItem("caa-level-1-cards");setCards(initialCards);setPhrase(["Eu","quero","água","por","favor"])}
  function addCard(){const c={id:crypto.randomUUID(),label:"Novo card",image:"/cards/level-1/mais.png",cat:"basic"};persist([...cards,c]);setEditing(c);setEditMode(true)}

  return <main className={`caa-page ${editMode?"caa-editing":""}`}>
    <header className="caa-header">
      <div>
        <div className="caa-level">Nível 1</div>
        <h1 className="caa-title">CAA Neuro</h1>
        <div className="caa-subtitle">Prancha de Comunicação Aumentativa e Alternativa</div>
      </div>
      <div className="caa-actions">
        <button className="caa-pill caa-pill-green">👤 Modo: Usuário</button>
        <button className="caa-pill" onClick={()=>setEditMode(!editMode)}>✎ {editMode?"Sair da edição":"Editar cartões"}</button>
        <button className="caa-pill caa-pill-pink" onClick={reset}>↻ Resetar prancha</button>
      </div>
    </header>

    <section className="caa-layout">
      <div>
        <section className="caa-phrase">
          <div className="caa-phrase-title">Frase atual</div>
          <div className="caa-words">
            {phrase.map((w,i)=><span className="caa-word" key={i}>{w}</span>)}
            <button className="caa-plus" onClick={()=>setPhrase([...phrase,""])}>+</button>
          </div>
          <div className="caa-buttons">
            <button className="caa-btn caa-green" onClick={()=>speak(phrase.join(" "))}>🔊 Falar frase</button>
            <button className="caa-btn caa-white" onClick={()=>setPhrase([])}>⌫ Limpar</button>
            <button className="caa-btn caa-yellow" onClick={()=>setPhrase(p=>p.slice(0,-1))}>↶ Desfazer</button>
            <button className="caa-btn caa-dark" onClick={addCard}>+ Novo card</button>
          </div>
        </section>

        <section className="caa-board">
          <div className="caa-grid">
            {cards.map(card=><article key={card.id} className={`caa-card cat-${card.cat} ${editing?.id===card.id?"active":""}`}>
              <div className="caa-card-inner">
                <button onClick={()=>selectCard(card)} style={{background:"transparent",border:0,padding:0,width:"100%"}}>
                  <div className="caa-img"><img src={card.image} alt={card.label}/></div>
                  <div className="caa-label">{card.label}</div>
                </button>
                <div className="caa-card-tools">
                  <button className="caa-small" onClick={()=>setEditing(card)}>Editar</button>
                  <button className="caa-small" onClick={()=>downloadImage(card)}>Baixar imagem</button>
                </div>
              </div>
            </article>)}
          </div>
        </section>
        <div className="caa-hint">🔊 Toque em qualquer card para ouvir a palavra/frase</div>
      </div>

      <aside className="caa-side">
        <button className="caa-close" onClick={()=>setEditing(null)}>×</button>
        <h2>Editar card</h2>
        {editing?<>
          <div className="caa-preview"><div className="caa-preview-inner"><img src={editing.image} alt={editing.label}/></div></div>
          <div className="caa-field">Nome do card</div>
          <input className="caa-input" value={editing.label} onChange={e=>setEditing({...editing,label:e.target.value})}/>
          <div className="caa-field">Imagem do card</div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>replaceImage(e.target.files?.[0])}/>
          <div className="caa-side-actions">
            <button className="caa-btn caa-white" onClick={()=>fileRef.current?.click()}>✎ Trocar imagem</button>
            <button className="caa-btn caa-white" onClick={()=>downloadImage(editing)}>⇩ Baixar imagem</button>
            <button className="caa-btn caa-green" onClick={saveEditing}>▣ Salvar alterações</button>
            <button className="caa-btn caa-white" onClick={()=>setEditing(null)}>← Cancelar</button>
          </div>
        </>:<p>Selecione um card para editar.</p>}
      </aside>
    </section>

    <section className="caa-info-grid">
      <div className="caa-info"><h3>Como usar</h3><p><b>1.</b> Toque nos cards para montar sua frase.<br/><b>2.</b> Clique em Falar frase.<br/><b>3.</b> Edite nomes e imagens.</p></div>
      <div className="caa-info"><h3>Cores por categoria</h3><p><span className="caa-dot" style={{background:"#f04494"}}/>Básico</p><p><span className="caa-dot" style={{background:"#ff9f2d"}}/>Necessidades</p><p><span className="caa-dot" style={{background:"#4fc667"}}/>Ações</p><p><span className="caa-dot" style={{background:"#4b95ff"}}/>Emoções</p></div>
      <div className="caa-info"><h3>Funcionalidades</h3><p>Fala ao tocar, monta frases, troca imagem, baixa imagem e salva no navegador.</p></div>
      <div className="caa-info"><h3>Dica de uso</h3><p>Personalize a prancha com palavras e imagens que façam sentido para o usuário.</p></div>
    </section>
  </main>
}
