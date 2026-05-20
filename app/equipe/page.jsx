"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Equipe() {
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [creating, setCreating] = useState(false);
  const [nomeOrg, setNomeOrg] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/org/minha").then(r => r.json()).then(d => {
      if (d.org) { setOrg(d.org); setMembers(d.members || []); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function criarOrg() {
    if (!nomeOrg.trim()) return;
    setCreating(true);
    const res = await fetch("/api/org", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ nome: nomeOrg }) });
    const d = await res.json();
    if (d.success) window.location.reload();
    else setMsg({ type:"error", text: d.error || "Erro ao criar organização" });
    setCreating(false);
  }

  async function convidar() {
    if (!email.trim() || !org) return;
    setSending(true); setMsg(null);
    const res = await fetch("/api/org/invite", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ org_id: org.id, email: email.trim(), role:"member" }) });
    const d = await res.json();
    if (d.success) { setMsg({ type:"ok", text:`Convite enviado para ${email}` }); setEmail(""); }
    else setMsg({ type:"error", text: d.error || "Erro ao enviar convite" });
    setSending(false);
  }

  const btn = { border:"none", padding:"10px 20px", borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"14px" };

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <div style={{background:"#071b2c",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"20px"}}>CAA Neuro</span>
        <button onClick={() => router.push("/app")} style={{...btn,background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"white"}}>← Prancha</button>
      </div>

      <div style={{maxWidth:"700px",margin:"0 auto",padding:"32px 24px"}}>
        <h1 style={{fontSize:"26px",fontWeight:"800",color:"#071b2c",marginBottom:"8px"}}>👥 Minha Equipe</h1>
        <p style={{color:"#6b7280",marginBottom:"32px"}}>Convide outros profissionais para colaborar na mesma organização.</p>

        {loading && <p style={{color:"#6b7280"}}>Carregando...</p>}

        {!loading && !org && (
          <div style={{background:"white",borderRadius:"16px",border:"1px solid #e5e7eb",padding:"28px"}}>
            <h2 style={{fontSize:"18px",fontWeight:"700",color:"#071b2c",marginBottom:"8px"}}>Criar organização</h2>
            <p style={{color:"#6b7280",fontSize:"14px",marginBottom:"20px"}}>Crie uma organização para convidar sua equipe.</p>
            <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
              <input value={nomeOrg} onChange={e=>setNomeOrg(e.target.value)} placeholder="Nome da clínica ou organização"
                style={{flex:1,padding:"10px 14px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px",minWidth:"200px"}} />
              <button onClick={criarOrg} disabled={creating} style={{...btn,background:"#00885f",color:"white"}}>
                {creating ? "Criando..." : "Criar"}
              </button>
            </div>
            {msg && <p style={{marginTop:"12px",color:msg.type==="ok"?"#00885f":"#ef4444",fontSize:"14px"}}>{msg.text}</p>}
          </div>
        )}

        {!loading && org && (
          <>
            <div style={{background:"white",borderRadius:"16px",border:"1px solid #e5e7eb",padding:"24px",marginBottom:"24px"}}>
              <div style={{fontSize:"13px",color:"#6b7280",marginBottom:"4px"}}>Organização</div>
              <div style={{fontSize:"20px",fontWeight:"800",color:"#071b2c"}}>{org.nome}</div>
            </div>

            <div style={{background:"white",borderRadius:"16px",border:"1px solid #e5e7eb",padding:"24px",marginBottom:"24px"}}>
              <h2 style={{fontSize:"16px",fontWeight:"700",color:"#071b2c",marginBottom:"16px"}}>✉️ Convidar profissional</h2>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@clinica.com"
                  style={{flex:1,padding:"10px 14px",borderRadius:"8px",border:"1px solid #e5e7eb",fontSize:"14px",minWidth:"200px"}} />
                <button onClick={convidar} disabled={sending} style={{...btn,background:"#00885f",color:"white"}}>
                  {sending ? "Enviando..." : "Convidar"}
                </button>
              </div>
              {msg && <p style={{marginTop:"12px",color:msg.type==="ok"?"#00885f":"#ef4444",fontSize:"14px"}}>{msg.text}</p>}
              <p style={{marginTop:"10px",fontSize:"12px",color:"#9ca3af"}}>O profissional receberá um email com link para entrar na sua equipe.</p>
            </div>

            <div style={{background:"white",borderRadius:"16px",border:"1px solid #e5e7eb",padding:"24px"}}>
              <h2 style={{fontSize:"16px",fontWeight:"700",color:"#071b2c",marginBottom:"16px"}}>👤 Membros ({members.length})</h2>
              {members.length === 0 && <p style={{color:"#9ca3af",fontSize:"14px"}}>Nenhum membro ainda. Convide alguém acima.</p>}
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {members.map((m,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#f9fafb",borderRadius:"10px"}}>
                    <div>
                      <div style={{fontWeight:"700",color:"#071b2c",fontSize:"14px"}}>{m.user_id}</div>
                      <div style={{fontSize:"12px",color:"#6b7280"}}>Entrou em {m.joined_at?.slice(0,10)}</div>
                    </div>
                    <span style={{background: m.role==="admin"?"#fef3c7":"#f0fdf4",color:m.role==="admin"?"#92400e":"#065f46",padding:"4px 10px",borderRadius:"999px",fontSize:"12px",fontWeight:"700"}}>
                      {m.role==="admin"?"Admin":"Membro"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
