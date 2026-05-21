"use client";
import AppShell from "../../components/AppShell";
import { useEffect, useRef, useState } from "react";

const emptyCards = () => Array.from({length:20}).map((_,i)=>({
  id:`card-${i+1}`, label:"", image:"", empty:true
}));

export default function PranchasTerapeuticas(){
  const [patients,setPatients]=useState([]);
  const [boards,setBoards]=useState([]);
  const [title,setTitle]=useState("Prancha terapêutica personalizada");
  const [patient,setPatient]=useState("");
  const [cards,setCards]=useState(emptyCards());
  const [token,setToken]=useState("");
  const [shareUrl,setShareUrl]=useState("");
  const [library,setLibrary]=useState([]);
  const [editing,setEditing]=useState(null);
  const fileRef=useRef(null);

  useEffect(()=>{ load(); },[]);
  async function load(){
    fetch("/api/patients").then(r=>r.json()).then(d=>setPatients(d.patients||[])).catch(()=>{});
    fetch("/api/profissional/pranchas").then(r=>r.json()).then(d=>setBoards(d.boards||[])).catch(()=>{});
    fetch("/api/images/library").then(r=>r.json()).then(d=>setLibrary([...(d.platformImages||[]),...(d.userImages||[])])).catch(()=>{});
  }

  function updateCard(id,patch){
    setCards(prev=>prev.map(c=>c.id===id?{...c,...patch,empty:false}:c));
  }

  async function upload(file){
    if(!file||!editing)return;
    const label = window.prompt("Nome da imagem:", editing.label || "Imagem do card") || editing.label || "Imagem";
    const fd=new FormData();
    fd.append("file",file);
    fd.append("label",label);
    const res=await fetch("/api/images/upload",{method:"POST",body:fd});
    const data=await res.json();
    if(!res.ok) return alert(data.error||"Erro no upload");
    updateCard(editing.id,{image:data.url,label:editing.label||label});
    if(fileRef.current) fileRef.current.value="";
  }

  async function save(){
    const finalTitle = patient ? `${title} — ${patient}` : title;
    const res=await fetch("/api/profissional/pranchas",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({token,title:finalTitle,cards})
    });
    const data=await res.json();
    if(!res.ok) return alert(data.error||"Erro ao salvar");
    setToken(data.token);
    setShareUrl(data.url);
    await load();
    alert("Prancha salva com sucesso.");
  }

  function openBoard(b){
    setTitle(b.title||"Prancha terapêutica");
    setCards(b.cards?.length?b.cards:emptyCards());
    setToken(b.token);
    setShareUrl(`https://www.adhdautism.online/prancha/${b.token}`);
  }

  return (
    <AppShell>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px",fontFamily:"system-ui"}}>
        <h1 style={{fontSize:28,fontWeight:900,color:"#071b2c",margin:"0 0 6px"}}>Pranchas Terapêuticas</h1>
        <p style={{color:"#6b7280",margin:"0 0 24px"}}>Crie pranchas únicas para cada paciente, compartilhe por link ou imprima para uso clínico.</p>

        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:20}}>
          <aside style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:18,height:"fit-content"}}>
            <button onClick={()=>{setToken("");setShareUrl("");setTitle("Prancha terapêutica personalizada");setCards(emptyCards());}}
              style={{width:"100%",background:"#00885f",color:"white",border:0,borderRadius:10,padding:"12px",fontWeight:800,cursor:"pointer"}}>
              + Nova prancha
            </button>

            <h3 style={{fontSize:14,color:"#071b2c",margin:"22px 0 10px"}}>Pranchas salvas</h3>
            {boards.map(b=>(
              <button key={b.token} onClick={()=>openBoard(b)}
                style={{width:"100%",textAlign:"left",background:token===b.token?"#f0fdf4":"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:10,marginBottom:8,cursor:"pointer"}}>
                <b style={{fontSize:13,color:"#071b2c"}}>{b.title}</b>
                <div style={{fontSize:11,color:"#6b7280"}}>{b.cards?.filter(c=>c.label||c.image).length||0} cards preenchidos</div>
              </button>
            ))}
          </aside>

          <main>
            <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:18,marginBottom:16}}>
              <label>Nome da prancha</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} style={inp}/>
              <label>Paciente</label>
              <select value={patient} onChange={e=>setPatient(e.target.value)} style={inp}>
                <option value="">Selecionar paciente</option>
                {patients.map(p=><option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>
                <button onClick={save} style={btnGreen}>Salvar prancha</button>
                {shareUrl && <a href={`mailto:?subject=Sua prancha CAA&body=Acesse sua prancha: ${shareUrl}`} style={btn}>Enviar por email</a>}
                {shareUrl && <a href={shareUrl} target="_blank" style={btn}>Abrir link</a>}
                <button onClick={()=>window.print()} style={btn}>Imprimir / PDF</button>
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>upload(e.target.files?.[0])}/>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:14}}>
              {cards.map(card=>(
                <div key={card.id} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:10}}>
                  <div style={{height:110,background:"#f3f4f6",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                    {card.image?<img src={card.image} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:32}}>+</span>}
                  </div>
                  <input value={card.label} placeholder="Nome do card" onChange={e=>updateCard(card.id,{label:e.target.value})} style={{...inp,marginTop:8,fontSize:12}}/>
                  <button onClick={()=>{setEditing(card);fileRef.current?.click();}} style={small}>Upload</button>
                  <select onChange={e=>e.target.value&&updateCard(card.id,{image:e.target.value})} style={{...inp,fontSize:11}}>
                    <option value="">Banco de imagens</option>
                    {library.map(img=><option key={img.id} value={img.url}>{img.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}

const inp={width:"100%",boxSizing:"border-box",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:10,margin:"6px 0 12px"};
const btnGreen={background:"#00885f",color:"white",border:0,borderRadius:10,padding:"10px 16px",fontWeight:800,cursor:"pointer",textDecoration:"none"};
const btn={background:"#f3f4f6",color:"#374151",border:0,borderRadius:10,padding:"10px 16px",fontWeight:700,cursor:"pointer",textDecoration:"none"};
const small={width:"100%",background:"#071b2c",color:"white",border:0,borderRadius:8,padding:"8px",fontSize:12,cursor:"pointer",marginBottom:8};
