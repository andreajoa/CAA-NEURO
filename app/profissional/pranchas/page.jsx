"use client";
import AppShell from "../../components/AppShell";
import { useEffect, useRef, useState } from "react";

const emptyCards = () => Array.from({length:20}).map((_,i)=>({
  id:`card-${i+1}`, label:"", image:"", empty:true, cat:"terapeutica"
}));

export default function PranchasTerapeuticas(){
  const [patients,setPatients]=useState([]);
  const [patientSearch,setPatientSearch]=useState("");
  const [selectedPatient,setSelectedPatient]=useState("");
  const [boards,setBoards]=useState([]);
  const [title,setTitle]=useState("Prancha terapêutica personalizada");
  const [cards,setCards]=useState(emptyCards());
  const [token,setToken]=useState("");
  const [shareUrl,setShareUrl]=useState("");
  const [editing,setEditing]=useState(null);

  const [imagePickerOpen,setImagePickerOpen]=useState(false);
  const [pickerTab,setPickerTab]=useState("buscar");
  const [imageLibrary,setImageLibrary]=useState({platformImages:[],userImages:[]});
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState([]);
  const [searchSource,setSearchSource]=useState("all");
  const [loadingImages,setLoadingImages]=useState(false);
  const [imageError,setImageError]=useState("");
  const [generatePrompt,setGeneratePrompt]=useState("");
  const [generating,setGenerating]=useState(false);
  const fileRef=useRef(null);

  useEffect(()=>{ loadAll(); },[]);

  async function loadAll(){
    fetch("/api/patients").then(r=>r.json()).then(d=>setPatients(d.patients||[])).catch(()=>{});
    fetch("/api/profissional/pranchas").then(r=>r.json()).then(d=>setBoards(d.boards||[])).catch(()=>{});
    await loadImageLibrary();
  }

  async function loadImageLibrary(){
    try{
      const r=await fetch("/api/images/library");
      const d=await r.json();
      setImageLibrary({platformImages:d.platformImages||[],userImages:d.userImages||[]});
    }catch{}
  }

  const filteredPatients = patients.filter(p => {
    const q = patientSearch.toLowerCase();
    return !q || (p.nome||p.name||"").toLowerCase().includes(q);
  });

  function updateCard(id,patch){
    setCards(prev=>prev.map(c=>c.id===id?{...c,...patch,empty:false}:c));
  }

  function openPicker(card){
    setEditing(card);
    setPickerTab("buscar");
    setSearchQuery(card.label||"");
    setGeneratePrompt(card.label||"");
    setImagePickerOpen(true);
    setImageError("");
    loadImageLibrary();
  }

  async function searchImages(){
    if(!searchQuery.trim()) return setImageError("Digite um termo para buscar.");
    setLoadingImages(true); setImageError("");
    try{
      const r=await fetch(`/api/images/search?q=${encodeURIComponent(searchQuery)}&source=${searchSource}`);
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Erro ao buscar.");
      setSearchResults(d.results||[]);
      if(!(d.results||[]).length) setImageError("Nenhuma imagem encontrada.");
    }catch(e){ setImageError(e.message||"Erro ao buscar imagens."); }
    setLoadingImages(false);
  }

  function chooseImage(url,label){
    if(!editing)return;
    updateCard(editing.id,{image:url,label:editing.label||label||""});
    setImagePickerOpen(false);
  }

  async function upload(file){
    if(!file||!editing)return;
    const label = window.prompt("Nome desta imagem no banco:", editing.label || "Imagem do card") || editing.label || "Imagem";
    const fd=new FormData();
    fd.append("file",file);
    fd.append("label",label);
    setLoadingImages(true); setImageError("");
    try{
      const r=await fetch("/api/images/upload",{method:"POST",body:fd});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Erro no upload.");
      const img={id:d.key||d.id,key:d.key,label:d.label||label,url:d.url,source:"platform"};
      setImageLibrary(prev=>({platformImages:[img,...(prev.platformImages||[])],userImages:prev.userImages||[]}));
      updateCard(editing.id,{image:d.url,label:editing.label||label});
      if(fileRef.current) fileRef.current.value="";
      setImagePickerOpen(false);
    }catch(e){ setImageError(e.message||"Erro no upload."); }
    setLoadingImages(false);
  }

  async function generateImage(){
    if(!editing || !generatePrompt.trim()) return;
    setGenerating(true); setImageError("");
    try{
      const r=await fetch("/api/generate-card-image",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({descricao:generatePrompt,estilo:"pictograma"})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Erro ao gerar imagem.");
      updateCard(editing.id,{image:d.url,label:editing.label||generatePrompt});
      setImagePickerOpen(false);
    }catch(e){ setImageError(e.message||"Erro ao gerar."); }
    setGenerating(false);
  }

  async function save(){
    const patientName = selectedPatient ? (patients.find(p=>String(p.id)===String(selectedPatient))?.nome || "") : "";
    const finalTitle = patientName ? `${title} — ${patientName}` : title;
    const r=await fetch("/api/profissional/pranchas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,title:finalTitle,cards})});
    const d=await r.json();
    if(!r.ok) return alert(d.error||"Erro ao salvar");
    setToken(d.token); setShareUrl(d.url);
    await loadAll();
    alert("Prancha salva com sucesso.");
  }

  function openBoard(b){
    setTitle(b.title||"Prancha terapêutica");
    setCards(b.cards?.length?b.cards:emptyCards());
    setToken(b.token);
    setShareUrl(`https://www.adhdautism.online/prancha/${b.token}`);
  }

  async function printPdf(){
    const r=await fetch("/api/export-board",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cards:cards.filter(c=>c.label||c.image),title,cols:4})});
    const html=await r.text();
    const w=window.open("","_blank");
    w.document.write(html); w.document.close();
  }

  return (
    <AppShell>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px",fontFamily:"system-ui"}}>
        <h1 style={{fontSize:28,fontWeight:900,color:"#071b2c",margin:"0 0 6px"}}>Pranchas Terapêuticas</h1>
        <p style={{color:"#6b7280",margin:"0 0 24px"}}>Monte pranchas individuais para cada paciente, compartilhe por link ou imprima em PDF.</p>

        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
          <aside style={panel}>
            <button onClick={()=>{setToken("");setShareUrl("");setTitle("Prancha terapêutica personalizada");setCards(emptyCards());}} style={btnGreen}>+ Nova prancha</button>
            <h3 style={h3}>Pranchas salvas</h3>
            {boards.map(b=>(
              <button key={b.token} onClick={()=>openBoard(b)} style={{...saved,background:token===b.token?"#f0fdf4":"white"}}>
                <b>{b.title}</b>
                <small>{b.cards?.filter(c=>c.label||c.image).length||0} cards preenchidos</small>
              </button>
            ))}
          </aside>

          <main>
            <section style={panel}>
              <label style={lbl}>Nome da prancha</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} style={inp}/>

              <label style={lbl}>Buscar paciente cadastrado</label>
              <input value={patientSearch} onChange={e=>setPatientSearch(e.target.value)} placeholder="Digite o nome do paciente..." style={inp}/>

              <label style={lbl}>Selecionar paciente</label>
              <select value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)} style={inp}>
                <option value="">Sem paciente vinculado</option>
                {filteredPatients.map(p=><option key={p.id} value={p.id}>{p.nome||p.name}</option>)}
              </select>

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12}}>
                <button onClick={save} style={btnGreen}>Salvar prancha</button>
                {shareUrl && <a href={`mailto:?subject=Sua prancha CAA&body=Acesse sua prancha: ${shareUrl}`} style={btn}>Enviar por email</a>}
                {shareUrl && <a href={shareUrl} target="_blank" style={btn}>Abrir link</a>}
                <button onClick={printPdf} style={btn}>Imprimir / PDF</button>
              </div>
            </section>

            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>upload(e.target.files?.[0])}/>

            <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:14}}>
              {cards.map(card=>(
                <article key={card.id} style={cardBox}>
                  <button onClick={()=>openPicker(card)} style={imgBox}>
                    {card.image?<img src={card.image} alt={card.label} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:30}}>+</span>}
                  </button>
                  <input value={card.label} onChange={e=>updateCard(card.id,{label:e.target.value})} placeholder="Nome do card" style={{...inp,fontSize:12,margin:"8px 0"}}/>
                  <button onClick={()=>openPicker(card)} style={smallBtn}>Adicionar imagem</button>
                </article>
              ))}
            </section>
          </main>
        </div>

        {imagePickerOpen && (
          <div style={overlay} onClick={()=>setImagePickerOpen(false)}>
            <div style={modal} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"start"}}>
                <div>
                  <h2 style={{margin:"0 0 4px",color:"#071b2c"}}>Banco de imagens</h2>
                  <p style={{margin:"0 0 16px",color:"#6b7280",fontSize:13}}>Busque, envie do dispositivo ou gere com IA.</p>
                </div>
                <button onClick={()=>setImagePickerOpen(false)} style={{fontSize:24,background:"none",border:0,cursor:"pointer"}}>×</button>
              </div>

              {imageError && <div style={err}>{imageError}</div>}

              <div style={{display:"flex",gap:6,borderBottom:"1px solid #e5e7eb",paddingBottom:12,marginBottom:14,flexWrap:"wrap"}}>
                {[["buscar","🔍 Buscar"],["minhas","📁 Biblioteca"],["upload","📱 Upload"],["gerar","✨ IA"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setPickerTab(id)} style={tab(pickerTab===id)}>{label}</button>
                ))}
              </div>

              {pickerTab==="buscar" && (
                <>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                    <select value={searchSource} onChange={e=>setSearchSource(e.target.value)} style={{...inp,width:160,margin:0}}>
                      <option value="all">Todas</option><option value="arasaac">ARASAAC</option><option value="mulberry">Mulberry</option><option value="sclera">Sclera</option><option value="symbotalk">SymboTalk</option>
                    </select>
                    <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchImages()} placeholder="Ex: água, dor, hospital..." style={{...inp,flex:1,margin:0}}/>
                    <button onClick={searchImages} style={btnGreen}>{loadingImages?"...":"Buscar"}</button>
                  </div>
                  <ImageGrid images={searchResults} chooseImage={chooseImage}/>
                </>
              )}

              {pickerTab==="minhas" && <ImageGrid images={[...imageLibrary.platformImages,...imageLibrary.userImages]} chooseImage={chooseImage}/>}

              {pickerTab==="upload" && (
                <button onClick={()=>fileRef.current?.click()} style={{...btn,width:"100%",padding:18,border:"1px dashed #94a3b8"}}>
                  Enviar imagem do computador, celular ou galeria
                </button>
              )}

              {pickerTab==="gerar" && (
                <div>
                  <input value={generatePrompt} onChange={e=>setGeneratePrompt(e.target.value)} placeholder="Descreva o pictograma..." style={inp}/>
                  <button onClick={generateImage} disabled={generating} style={btnGreen}>{generating?"Gerando...":"Gerar imagem"}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ImageGrid({images,chooseImage}){
  return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(95px,1fr))",gap:8,maxHeight:420,overflowY:"auto"}}>
    {(images||[]).map(img=>(
      <button key={img.id||img.url} onClick={()=>chooseImage(img.url,img.label)} style={imgChoice}>
        <img src={img.url} alt={img.label} style={{width:64,height:64,objectFit:"contain"}}/>
        <span style={{fontSize:11,color:"#374151",textAlign:"center"}}>{img.label}</span>
      </button>
    ))}
  </div>
}

const panel={background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:18,marginBottom:16};
const h3={fontSize:14,color:"#071b2c",margin:"22px 0 10px"};
const lbl={fontSize:12,fontWeight:800,color:"#374151"};
const inp={width:"100%",boxSizing:"border-box",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:10,margin:"6px 0 12px"};
const btnGreen={background:"#00885f",color:"white",border:0,borderRadius:10,padding:"10px 16px",fontWeight:800,cursor:"pointer",textDecoration:"none"};
const btn={background:"#f3f4f6",color:"#374151",border:0,borderRadius:10,padding:"10px 16px",fontWeight:700,cursor:"pointer",textDecoration:"none"};
const saved={width:"100%",textAlign:"left",border:"1px solid #e5e7eb",borderRadius:10,padding:10,marginBottom:8,cursor:"pointer",display:"flex",flexDirection:"column",gap:4};
const cardBox={background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:10};
const imgBox={width:"100%",height:110,background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"pointer"};
const smallBtn={width:"100%",background:"#071b2c",color:"white",border:0,borderRadius:8,padding:"8px",fontSize:12,cursor:"pointer"};
const overlay={position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16};
const modal={background:"white",borderRadius:18,padding:20,width:"min(760px,96vw)",maxHeight:"88vh",overflowY:"auto"};
const err={background:"#fef2f2",border:"1px solid #fecaca",color:"#b91c1c",borderRadius:10,padding:10,fontSize:13,marginBottom:12};
const tab=active=>({padding:"8px 14px",border:0,borderRadius:8,cursor:"pointer",background:active?"#2563eb":"#f3f4f6",color:active?"white":"#374151",fontWeight:700});
const imgChoice={background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:8,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4};
