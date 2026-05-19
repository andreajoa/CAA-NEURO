"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const NAV = () => (
  <nav style={{background:"#071b2c",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #00885f"}}>
    <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
    <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
    <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👥 Pacientes</a>
    <a href="/admin" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📊 Admin</a>
    <a href="/institucional" style={{color:"white",textDecoration:"none",background:"rgba(78,201,160,0.3)",border:"1px solid #4ec9a0",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏛️ Institucional</a>
  </nav>
);

const S = {
  page: {minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,Helvetica,sans-serif"},
  container: {maxWidth:"1000px",margin:"0 auto",padding:"32px 24px"},
  card: {background:"white",borderRadius:"16px",border:"1px solid #e2e8f0",padding:"24px",marginBottom:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},
  title: {fontSize:"28px",fontWeight:"900",color:"#071b2c",margin:"0 0 4px"},
  btn: {border:"none",borderRadius:"10px",padding:"10px 20px",fontWeight:"700",cursor:"pointer",fontSize:"14px"},
  inp: {width:"100%",border:"1px solid #d4dde5",borderRadius:"10px",padding:"10px 14px",fontSize:"14px",fontFamily:"inherit",boxSizing:"border-box"},
  lbl: {display:"block",fontSize:"12px",fontWeight:"700",color:"#4b5563",marginBottom:"6px",marginTop:"14px"},
};

export default function InstitucionalPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [form, setForm] = useState({nome:"",tipo:"prefeitura",cidade:"",estado:"",cnpj:"",responsavel:"",email:""});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("profissional");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState("");

  const loadOrgs = async () => {
    const r = await fetch("/api/org");
    const d = await r.json();
    setOrgs(d.organizations || []);
  };

  const loadOrgDetails = async (id) => {
    setLoading(true);
    const r = await fetch(`/api/org?org_id=${id}`);
    const d = await r.json();
    setOrgDetails(d);
    setLoading(false);
  };

  useEffect(() => { loadOrgs(); }, []);

  const createOrg = async () => {
    if (!form.nome.trim()) return;
    setLoading(true);
    const r = await fetch("/api/org", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.success) { setForm({nome:"",tipo:"prefeitura",cidade:"",estado:"",cnpj:"",responsavel:"",email:""}); setView("list"); await loadOrgs(); }
    setLoading(false);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;
    setInviteLoading(true);
    setInviteResult("");
    const r = await fetch("/api/org/invite", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ org_id: selectedOrg.id, email: inviteEmail, role: inviteRole })
    });
    const d = await r.json();
    setInviteResult(d.success ? "✅ Convite enviado com sucesso!" : `❌ ${d.error}`);
    setInviteEmail("");
    setInviteLoading(false);
  };

  const tipoLabel = {prefeitura:"🏛️ Prefeitura", clinica:"🏥 Clínica", escola:"🏫 Escola", hospital:"🏨 Hospital", ong:"🤝 ONG"};

  if (view === "nova") return (
    <div style={S.page}>
      <NAV />
      <div style={S.container}>
        <div style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"24px"}}>
          <button onClick={()=>setView("list")} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>← Voltar</button>
          <h1 style={S.title}>Nova Organização</h1>
        </div>
        <div style={S.card}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Nome da organização *</label>
              <input style={S.inp} value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: Prefeitura de São Paulo — Secretaria de Saúde" />
            </div>
            <div>
              <label style={S.lbl}>Tipo</label>
              <select style={S.inp} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                <option value="prefeitura">Prefeitura</option>
                <option value="clinica">Clínica</option>
                <option value="escola">Escola</option>
                <option value="hospital">Hospital</option>
                <option value="ong">ONG</option>
              </select>
            </div>
            <div>
              <label style={S.lbl}>CNPJ</label>
              <input style={S.inp} value={form.cnpj} onChange={e=>setForm({...form,cnpj:e.target.value})} placeholder="00.000.000/0001-00" />
            </div>
            <div>
              <label style={S.lbl}>Cidade</label>
              <input style={S.inp} value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})} placeholder="São Paulo" />
            </div>
            <div>
              <label style={S.lbl}>Estado</label>
              <input style={S.inp} value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} placeholder="SP" />
            </div>
            <div>
              <label style={S.lbl}>Responsável</label>
              <input style={S.inp} value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} placeholder="Nome do gestor" />
            </div>
            <div>
              <label style={S.lbl}>E-mail institucional</label>
              <input style={S.inp} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="gestor@prefeitura.sp.gov.br" />
            </div>
          </div>
          <button onClick={createOrg} disabled={loading||!form.nome} style={{...S.btn,background:"#00885f",color:"white",marginTop:"20px",opacity:loading||!form.nome?0.5:1}}>
            {loading?"Criando...":"Criar organização"}
          </button>
        </div>
      </div>
    </div>
  );

  if (view === "detalhes" && selectedOrg) return (
    <div style={S.page}>
      <NAV />
      <div style={S.container}>
        <div style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"24px",flexWrap:"wrap"}}>
          <button onClick={()=>{setView("list");setSelectedOrg(null);setOrgDetails(null);}} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>← Organizações</button>
          <div>
            <h1 style={{...S.title,fontSize:"22px"}}>{selectedOrg.nome}</h1>
            <p style={{fontSize:"13px",color:"#6b7280",margin:0}}>{tipoLabel[selectedOrg.tipo]||selectedOrg.tipo} · {selectedOrg.cidade||""}{selectedOrg.estado?`, ${selectedOrg.estado}`:""}</p>
          </div>
        </div>

        {/* Stats da organização */}
        {orgDetails && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"16px"}}>
            {[
              {label:"Profissionais",val:orgDetails.members?.length||0,icon:"👩‍⚕️",color:"#eff6ff",tc:"#1d4ed8"},
              {label:"Pacientes",val:orgDetails.stats?.patients||0,icon:"👥",color:"#f0fdf4",tc:"#166534"},
              {label:"Sessões",val:orgDetails.stats?.sessions||0,icon:"📋",color:"#fdf4ff",tc:"#7e22ce"},
            ].map(s=>(
              <div key={s.label} style={{background:s.color,borderRadius:"14px",padding:"16px",textAlign:"center"}}>
                <div style={{fontSize:"28px",marginBottom:"4px"}}>{s.icon}</div>
                <div style={{fontSize:"28px",fontWeight:"900",color:s.tc}}>{s.val}</div>
                <div style={{fontSize:"12px",color:"#6b7280"}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Convidar profissional */}
        <div style={S.card}>
          <h2 style={{fontSize:"16px",fontWeight:"800",color:"#071b2c",marginBottom:"16px"}}>➕ Convidar profissional</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:"10px",alignItems:"end"}}>
            <div>
              <label style={S.lbl}>E-mail do profissional</label>
              <input style={S.inp} value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="fonoaudiologo@email.com" />
            </div>
            <div>
              <label style={S.lbl}>Perfil</label>
              <select style={{...S.inp,width:"auto"}} value={inviteRole} onChange={e=>setInviteRole(e.target.value)}>
                <option value="profissional">Profissional</option>
                <option value="admin">Administrador</option>
                <option value="visualizador">Visualizador</option>
              </select>
            </div>
            <button onClick={sendInvite} disabled={inviteLoading||!inviteEmail}
              style={{...S.btn,background:"#00885f",color:"white",opacity:inviteLoading||!inviteEmail?0.5:1,marginTop:"auto"}}>
              {inviteLoading?"Enviando...":"Enviar convite"}
            </button>
          </div>
          {inviteResult && <div style={{marginTop:"10px",fontSize:"13px",color:inviteResult.includes("✅")?"#166534":"#dc2626"}}>{inviteResult}</div>}
        </div>

        {/* Lista de membros */}
        <div style={S.card}>
          <h2 style={{fontSize:"16px",fontWeight:"800",color:"#071b2c",marginBottom:"16px"}}>
            👩‍⚕️ Profissionais ({orgDetails?.members?.length||0})
          </h2>
          {loading && <p style={{color:"#9ca3af",fontSize:"13px"}}>Carregando...</p>}
          {!loading && (!orgDetails?.members?.length) && <p style={{color:"#9ca3af",fontSize:"13px"}}>Nenhum profissional cadastrado ainda.</p>}
          {orgDetails?.members?.map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:"1px solid #f3f4f6"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"#00885f",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"14px",flexShrink:0}}>
                {(m.nome||m.email||"P").charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:"14px",fontWeight:"600",color:"#1f2937"}}>{m.nome||m.email||m.user_id}</div>
                <div style={{fontSize:"12px",color:"#6b7280"}}>{m.email||""}{m.unidade?` · ${m.unidade}`:""}</div>
              </div>
              <span style={{background:m.role==="admin"?"#eff6ff":m.role==="visualizador"?"#fefce8":"#f0fdf4",color:m.role==="admin"?"#1d4ed8":m.role==="visualizador"?"#854d0e":"#166534",padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"700"}}>
                {m.role==="admin"?"Administrador":m.role==="visualizador"?"Visualizador":"Profissional"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <NAV />
      <div style={S.container}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h1 style={S.title}>🏛️ Painel Institucional</h1>
            <p style={{margin:"4px 0 0",fontSize:"14px",color:"#6b7280"}}>{orgs.length} organização{orgs.length!==1?"s":""} cadastrada{orgs.length!==1?"s":""}</p>
          </div>
          <button onClick={()=>setView("nova")} style={{...S.btn,background:"#00885f",color:"white",fontSize:"15px",padding:"12px 24px"}}>
            + Nova organização
          </button>
        </div>

        {orgs.length===0 ? (
          <div style={{...S.card,textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontSize:"56px",marginBottom:"16px"}}>🏛️</div>
            <div style={{fontSize:"18px",fontWeight:"700",color:"#1f2937",marginBottom:"8px"}}>Nenhuma organização cadastrada</div>
            <p style={{color:"#6b7280",marginBottom:"24px"}}>Crie uma organização para gerenciar múltiplos profissionais, ver relatórios por unidade e apresentar para prefeituras e secretarias.</p>
            <button onClick={()=>setView("nova")} style={{...S.btn,background:"#00885f",color:"white",fontSize:"15px",padding:"12px 28px"}}>Criar primeira organização</button>
          </div>
        ) : orgs.map(org=>(
          <div key={org.id} style={{...S.card,display:"flex",alignItems:"center",gap:"16px",cursor:"pointer"}}
            onClick={()=>{setSelectedOrg(org);setView("detalhes");loadOrgDetails(org.id);}}>
            <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#071b2c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>
              {org.tipo==="prefeitura"?"🏛️":org.tipo==="clinica"?"🏥":org.tipo==="escola"?"🏫":org.tipo==="hospital"?"🏨":"🤝"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:"800",fontSize:"16px",color:"#071b2c"}}>{org.nome}</div>
              <div style={{fontSize:"13px",color:"#6b7280",marginTop:"2px"}}>
                {tipoLabel[org.tipo]||org.tipo}{org.cidade?` · ${org.cidade}`:""}
                {org.responsavel?` · ${org.responsavel}`:""}
              </div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <span style={{background:org.ativo?"#f0fdf4":"#fef2f2",color:org.ativo?"#166534":"#dc2626",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"700"}}>
                {org.ativo?"Ativa":"Inativa"}
              </span>
              <button style={{...S.btn,background:"#eff6ff",color:"#2563eb",padding:"8px 14px",fontSize:"13px"}}>Ver detalhes →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
