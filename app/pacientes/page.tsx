"use client";
import { useState, useEffect } from "react";

type Patient = {
  id: number; nome: string; data_nascimento?: string; diagnostico?: string;
  responsavel?: string; escola?: string; medicamentos?: string;
  objetivos_terapeuticos?: string; observacoes?: string; created_at?: string;
};

const emptyForm = { nome:"", data_nascimento:"", diagnostico:"", responsavel:"", escola:"", medicamentos:"", objetivos_terapeuticos:"", observacoes:"" };

const NAV = () => (
  <nav style={{background:"#1B2D5B",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #C76B4A"}}>
    <span style={{color:"#E8B4A8",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
    <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
    <a href="/biblioteca" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>📚 Biblioteca</a>
    <a href="/paciente" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👤 Modo Paciente</a>
    <a href="/atividades" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🎮 Atividades</a>
    <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(78,201,160,0.3)",border:"1px solid #E8B4A8",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>✨ Relatório IA</a>
    <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px",marginLeft:"auto"}}>❓ Ajuda</a>
  </nav>
);

const S = {
  page: {minHeight:"100vh",background:"#F2E8E1",fontFamily:"Arial,Helvetica,sans-serif"},
  container: {maxWidth:"900px",margin:"0 auto",padding:"32px 24px"},
  card: {background:"white",borderRadius:"16px",border:"1px solid #e2e8f0",padding:"24px",marginBottom:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},
  title: {margin:"0 0 4px",fontSize:"28px",fontWeight:"900",color:"#1B2D5B"},
  btn: {border:"none",borderRadius:"10px",padding:"10px 20px",fontWeight:"700",cursor:"pointer",fontSize:"14px"},
  inp: {width:"100%",border:"1px solid #d4dde5",borderRadius:"10px",padding:"10px 14px",fontSize:"14px",fontFamily:"inherit",boxSizing:"border-box" as const},
  lbl: {display:"block",fontSize:"12px",fontWeight:"700",color:"#4b5563",marginBottom:"6px",marginTop:"14px"},
  badge: (color: string) => ({background:color,borderRadius:"6px",padding:"3px 10px",fontSize:"11px",fontWeight:"700"}),
};

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Patient|null>(null);
  const [selected, setSelected] = useState<Patient|null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionForm, setSessionForm] = useState({evolucao_observada:"",notas:"",objetivos_sessao:"",duracao_minutos:""});
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list"|"form"|"prontuario">("list");
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

  const load = async () => {
    const r = await fetch("/api/patients");
    const d = await r.json();
    setPatients(d.patients || []);
  };

  const loadSessions = async (pid: number) => {
    const r = await fetch(`/api/sessions?patient_id=${pid}`);
    const d = await r.json();
    setSessions(d.sessions || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    const method = editing ? "PUT" : "POST";
    const body = editing ? {...form, id: editing.id} : form;
    await fetch("/api/patients", {method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)});
    setForm(emptyForm); setEditing(null); setView("list");
    await load(); setLoading(false);
  };

  const del = async (id: number) => {
    if (!confirm("Excluir paciente e todo seu histórico?")) return;
    await fetch(`/api/patients?id=${id}`, {method:"DELETE"});
    await load();
  };

  const openProntuario = async (p: Patient) => {
    setSelected(p); setInsight(""); setInsightError("");
    await loadSessions(p.id); setView("prontuario");
  };

  const saveSession = async () => {
    if (!selected) return;
    setLoading(true);
    await fetch("/api/sessions", {method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({patient_id: selected.id, ...sessionForm, duracao_minutos: sessionForm.duracao_minutos ? Number(sessionForm.duracao_minutos) : null})
    });
    setSessionForm({evolucao_observada:"",notas:"",objetivos_sessao:"",duracao_minutos:""});
    await loadSessions(selected.id); setLoading(false);
  };

  const gerarInsight = async () => {
    if (!selected) return;
    setInsightLoading(true); setInsightError(""); setInsight("");
    try {
      const r = await fetch(`/api/insights?patient_id=${selected.id}`);
      const d = await r.json();
      if (d.insight) setInsight(d.insight);
      else setInsightError(d.error || "Erro ao gerar análise.");
    } catch { setInsightError("Erro de conexão."); }
    setInsightLoading(false);
  };

  if (view === "form") return (
    <div style={S.page}>
      <NAV />
      <div style={S.container}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px"}}>
          <button onClick={()=>{setView("list");setEditing(null);setForm(emptyForm);}} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>← Voltar</button>
          <h1 style={S.title}>{editing ? "Editar Paciente" : "Novo Paciente"}</h1>
        </div>
        <div style={S.card}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Nome completo *</label>
              <input style={S.inp} value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome do paciente" />
            </div>
            <div>
              <label style={S.lbl}>Data de nascimento</label>
              <input type="date" style={S.inp} value={form.data_nascimento} onChange={e=>setForm({...form,data_nascimento:e.target.value})} />
            </div>
            <div>
              <label style={S.lbl}>Diagnóstico</label>
              <input style={S.inp} value={form.diagnostico} onChange={e=>setForm({...form,diagnostico:e.target.value})} placeholder="Ex: TEA, PCI..." />
            </div>
            <div>
              <label style={S.lbl}>Responsável</label>
              <input style={S.inp} value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} placeholder="Nome do responsável" />
            </div>
            <div>
              <label style={S.lbl}>Escola</label>
              <input style={S.inp} value={form.escola} onChange={e=>setForm({...form,escola:e.target.value})} placeholder="Nome da escola" />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Medicamentos</label>
              <input style={S.inp} value={form.medicamentos} onChange={e=>setForm({...form,medicamentos:e.target.value})} placeholder="Medicamentos em uso" />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Objetivos terapêuticos</label>
              <textarea style={{...S.inp,height:"80px",resize:"vertical"}} value={form.objetivos_terapeuticos} onChange={e=>setForm({...form,objetivos_terapeuticos:e.target.value})} placeholder="Descreva os objetivos..." />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Observações</label>
              <textarea style={{...S.inp,height:"80px",resize:"vertical"}} value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Observações gerais..." />
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
            <button onClick={save} disabled={loading||!form.nome} style={{...S.btn,background:"#C76B4A",color:"white",opacity:loading||!form.nome?0.5:1}}>
              {loading?"Salvando...":"Salvar Paciente"}
            </button>
            <button onClick={()=>{setView("list");setEditing(null);setForm(emptyForm);}} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (view === "prontuario" && selected) return (
    <div style={S.page}>
      <NAV />
      <div style={S.container}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px",flexWrap:"wrap"}}>
          <button onClick={()=>setView("list")} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>← Pacientes</button>
          <h1 style={{...S.title,fontSize:"22px"}}>{selected.nome}</h1>
          <div style={{marginLeft:"auto",display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <a href={`/api/report?patient_id=${selected.id}`} target="_blank" style={{...S.btn,background:"#2563eb",color:"white",textDecoration:"none",display:"inline-block"}}>📄 PDF</a>
            <a href={`/api/export?patient_id=${selected.id}&format=xlsx`} style={{...S.btn,background:"#16a34a",color:"white",textDecoration:"none",display:"inline-block"}}>📊 Excel</a>
            <a href={`/api/export?patient_id=${selected.id}&format=csv`} style={{...S.btn,background:"#f3f4f6",color:"#374151",textDecoration:"none",display:"inline-block"}}>CSV</a>
            <button onClick={()=>{setEditing(selected);setForm({nome:selected.nome,data_nascimento:selected.data_nascimento||"",diagnostico:selected.diagnostico||"",responsavel:selected.responsavel||"",escola:selected.escola||"",medicamentos:selected.medicamentos||"",objetivos_terapeuticos:selected.objetivos_terapeuticos||"",observacoes:selected.observacoes||""});setView("form");}} style={{...S.btn,background:"#f3f4f6",color:"#374151"}}>✏️ Editar</button>
          </div>
        </div>

        {/* Dados clínicos */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
          {([["🩺 Diagnóstico",selected.diagnostico,"#eff6ff","#1d4ed8"],["👤 Responsável",selected.responsavel,"#f0fdf4","#166534"],["🏫 Escola",selected.escola,"#fefce8","#854d0e"],["💊 Medicamentos",selected.medicamentos,"#fdf4ff","#7e22ce"]] as [string,string|undefined,string,string][]).map(([k,v,bg,color])=> v ? (
            <div key={k} style={{background:bg,borderRadius:"12px",padding:"14px 16px",border:`1px solid ${color}22`}}>
              <div style={{fontSize:"11px",fontWeight:"700",color,marginBottom:"4px"}}>{k}</div>
              <div style={{fontSize:"14px",fontWeight:"600",color:"#1f2937"}}>{v}</div>
            </div>
          ) : null)}
          {selected.objetivos_terapeuticos && (
            <div style={{gridColumn:"1/-1",background:"#f0fdf4",borderRadius:"12px",padding:"14px 16px",border:"1px solid #bbf7d0"}}>
              <div style={{fontSize:"11px",fontWeight:"700",color:"#166534",marginBottom:"4px"}}>🎯 Objetivos terapêuticos</div>
              <div style={{fontSize:"14px",color:"#1f2937"}}>{selected.objetivos_terapeuticos}</div>
            </div>
          )}
        </div>

        {/* Painel IA */}
        <div style={{...S.card,background:"linear-gradient(135deg,#f5f3ff,#fdf4ff)",border:"1px solid #ddd6fe"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
            <div>
              <div style={{fontSize:"16px",fontWeight:"800",color:"#5b21b6"}}>✨ Análise clínica com IA</div>
              <div style={{fontSize:"12px",color:"#7c3aed",marginTop:"2px"}}>Baseada no histórico de {sessions.length} sessões registradas</div>
            </div>
            <button onClick={gerarInsight} disabled={insightLoading}
              style={{...S.btn,background:"#7c3aed",color:"white",opacity:insightLoading?0.6:1}}>
              {insightLoading?"Analisando...":"✨ Gerar análise"}
            </button>
          </div>
          {insightLoading && (
            <div style={{marginTop:"16px",padding:"16px",background:"rgba(255,255,255,0.6)",borderRadius:"10px",textAlign:"center",color:"#7c3aed",fontSize:"14px"}}>
              A IA está analisando as sessões...
            </div>
          )}
          {insightError && (
            <div style={{marginTop:"16px",padding:"14px",background:"#fef2f2",borderRadius:"10px",color:"#dc2626",fontSize:"13px"}}>{insightError}</div>
          )}
          {insight && (
            <div style={{marginTop:"16px",padding:"16px",background:"white",borderRadius:"10px",border:"1px solid #ede9fe",fontSize:"14px",color:"#1f2937",lineHeight:"1.7",whiteSpace:"pre-wrap"}}>{insight}</div>
          )}
        </div>

        {/* Registrar sessão */}
        <div style={S.card}>
          <div style={{fontSize:"16px",fontWeight:"800",color:"#1B2D5B",marginBottom:"16px"}}>📋 Registrar sessão</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Evolução observada *</label>
              <textarea style={{...S.inp,height:"80px",resize:"vertical"}} value={sessionForm.evolucao_observada} onChange={e=>setSessionForm({...sessionForm,evolucao_observada:e.target.value})} placeholder="Como foi a sessão? O que o paciente fez?" />
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={S.lbl}>Objetivos da sessão</label>
              <input style={S.inp} value={sessionForm.objetivos_sessao} onChange={e=>setSessionForm({...sessionForm,objetivos_sessao:e.target.value})} placeholder="O que foi trabalhado hoje?" />
            </div>
            <div>
              <label style={S.lbl}>Duração (min)</label>
              <input type="number" style={S.inp} value={sessionForm.duracao_minutos} onChange={e=>setSessionForm({...sessionForm,duracao_minutos:e.target.value})} placeholder="45" />
            </div>
            <div>
              <label style={S.lbl}>Notas</label>
              <input style={S.inp} value={sessionForm.notas} onChange={e=>setSessionForm({...sessionForm,notas:e.target.value})} placeholder="Observações" />
            </div>
          </div>
          <button onClick={saveSession} disabled={loading||!sessionForm.evolucao_observada}
            style={{...S.btn,background:"#C76B4A",color:"white",marginTop:"16px",opacity:loading||!sessionForm.evolucao_observada?0.5:1}}>
            {loading?"Salvando...":"✅ Salvar sessão"}
          </button>
        </div>

        {/* Histórico */}
        <div style={{fontSize:"16px",fontWeight:"800",color:"#1B2D5B",marginBottom:"12px"}}>
          🕐 Histórico de sessões ({sessions.length})
        </div>
        {sessions.length === 0 ? (
          <div style={{...S.card,textAlign:"center",color:"#9ca3af",padding:"40px"}}>Nenhuma sessão registrada ainda.</div>
        ) : sessions.map((s,i) => (
          <div key={s.id} style={{...S.card,borderLeft:"4px solid #C76B4A",paddingLeft:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <span style={{fontSize:"13px",fontWeight:"700",color:"#C76B4A"}}>Sessão #{sessions.length - i}</span>
              <span style={{fontSize:"12px",color:"#9ca3af"}}>{new Date(s.created_at).toLocaleDateString("pt-BR")}{s.duracao_minutos ? ` · ${s.duracao_minutos} min` : ""}</span>
            </div>
            {s.evolucao_observada && <p style={{margin:"0 0 4px",fontSize:"14px",color:"#1f2937"}}>{s.evolucao_observada}</p>}
            {s.objetivos_sessao && <p style={{margin:"0 0 4px",fontSize:"12px",color:"#2563eb"}}>Objetivo: {s.objetivos_sessao}</p>}
            {s.notas && <p style={{margin:0,fontSize:"12px",color:"#9ca3af"}}>Nota: {s.notas}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <NAV />
      <div style={S.container}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h1 style={S.title}>👥 Pacientes</h1>
            <p style={{margin:"4px 0 0",fontSize:"14px",color:"#6b7280"}}>{patients.length} paciente{patients.length !== 1 ? "s" : ""} cadastrado{patients.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={()=>setView("form")} style={{...S.btn,background:"#C76B4A",color:"white",fontSize:"15px",padding:"12px 24px"}}>
            + Novo Paciente
          </button>
        </div>

        {patients.length === 0 ? (
          <div style={{...S.card,textAlign:"center",padding:"60px 24px"}}>
            <div style={{fontSize:"56px",marginBottom:"16px"}}>👤</div>
            <div style={{fontSize:"18px",fontWeight:"700",color:"#1f2937",marginBottom:"8px"}}>Nenhum paciente cadastrado</div>
            <p style={{color:"#6b7280",marginBottom:"24px"}}>Cadastre o primeiro paciente para começar a registrar sessões e gerar relatórios.</p>
            <button onClick={()=>setView("form")} style={{...S.btn,background:"#C76B4A",color:"white",fontSize:"15px",padding:"12px 28px"}}>Cadastrar primeiro paciente</button>
          </div>
        ) : patients.map(p => (
          <div key={p.id} onClick={()=>openProntuario(p)}
            style={{...S.card,display:"flex",alignItems:"center",gap:"16px",cursor:"pointer",transition:"box-shadow 0.15s"}}
            onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 20px rgba(0,136,95,0.15)")}
            onMouseLeave={e=>(e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)")}>
            <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"#C76B4A",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"900",fontSize:"20px",flexShrink:0}}>
              {p.nome.charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:"800",fontSize:"16px",color:"#1B2D5B"}}>{p.nome}</div>
              <div style={{fontSize:"13px",color:"#6b7280",marginTop:"2px"}}>
                {p.diagnostico || "Sem diagnóstico"}{p.escola ? ` · ${p.escola}` : ""}
              </div>
            </div>
            <div style={{display:"flex",gap:"8px"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>openProntuario(p)} style={{...S.btn,background:"#eff6ff",color:"#2563eb",padding:"8px 14px",fontSize:"13px"}}>Ver prontuário</button>
              <button onClick={()=>del(p.id)} style={{...S.btn,background:"#fef2f2",color:"#dc2626",padding:"8px 14px",fontSize:"13px"}}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
