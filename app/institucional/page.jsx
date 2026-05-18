"use client";
import { useState, useEffect } from "react";
import { Users, BarChart3, Building2, Plus, ChevronRight, Activity } from "lucide-react";

export default function InstitucionalPage() {
  const [orgs, setOrgs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome:"", tipo:"clinica", cidade:"", estado:"", cnpj:"", responsavel:"", email:"" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => { loadOrgs(); }, []);

  async function loadOrgs() {
    setLoading(true);
    const r = await fetch("/api/org").then(r => r.json());
    setOrgs(r.organizations || []);
    setLoading(false);
  }

  async function loadDetail(org) {
    setSelected(org);
    const r = await fetch(`/api/org?org_id=${org.id}`).then(r => r.json());
    setDetail(r);
  }

  async function createOrg(e) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/org", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    const d = await r.json();
    if (d.success) { setShowForm(false); setForm({ nome:"", tipo:"clinica", cidade:"", estado:"", cnpj:"", responsavel:"", email:"" }); loadOrgs(); }
    setSaving(false);
  }

  const inp = { width:"100%", padding:"10px 12px", borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:"14px", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { fontSize:"13px", fontWeight:"600", color:"#374151", display:"block", marginBottom:"6px" };

  const tipoLabel = { clinica:"Clínica", prefeitura:"Prefeitura", escola:"Escola", sus:"UBS/SUS", outro:"Outro" };
  const tipoColor = { clinica:"#2563eb", prefeitura:"#7c3aed", escola:"#059669", sus:"#dc2626", outro:"#6b7280" };

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e7eb", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ fontWeight:"800", fontSize:"20px", color:"#00885f" }}>CAA Neuro — Painel Institucional</div>
        <div style={{ display:"flex", gap:"12px" }}>
          <a href="/admin" style={{ color:"#374151", fontSize:"14px", textDecoration:"none", padding:"9px 16px", border:"1px solid #e5e7eb", borderRadius:"8px" }}>Admin</a>
          <a href="/pacientes" style={{ color:"#374151", fontSize:"14px", textDecoration:"none", padding:"9px 16px", border:"1px solid #e5e7eb", borderRadius:"8px" }}>← Plataforma</a>
        </div>
      </div>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ fontSize:"26px", fontWeight:"800", color:"#071b2c", margin:"0 0 4px" }}>Organizações cadastradas</h1>
            <p style={{ color:"#6b7280", fontSize:"14px", margin:0 }}>Clínicas, prefeituras, escolas e UBS usando o CAA Neuro.</p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ display:"flex", alignItems:"center", gap:"8px", background:"#00885f", color:"white", border:"none", padding:"12px 24px", borderRadius:"10px", fontSize:"14px", fontWeight:"700", cursor:"pointer" }}>
            <Plus size={16} /> Nova organização
          </button>
        </div>

        {showForm && (
          <div style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"32px", marginBottom:"32px" }}>
            <h2 style={{ fontSize:"18px", fontWeight:"800", color:"#071b2c", margin:"0 0 24px" }}>Cadastrar organização</h2>
            <form onSubmit={createOrg} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"16px" }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Nome da organização *</label>
                <input style={inp} value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required placeholder="Ex: Clínica Fono SP" />
              </div>
              <div>
                <label style={lbl}>Tipo</label>
                <select style={inp} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                  {Object.entries(tipoLabel).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Cidade</label>
                <input style={inp} value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})} placeholder="São Paulo" />
              </div>
              <div>
                <label style={lbl}>Estado</label>
                <input style={inp} value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} placeholder="SP" maxLength={2} />
              </div>
              <div>
                <label style={lbl}>CNPJ</label>
                <input style={inp} value={form.cnpj} onChange={e=>setForm({...form,cnpj:e.target.value})} placeholder="00.000.000/0001-00" />
              </div>
              <div>
                <label style={lbl}>Responsável</label>
                <input style={inp} value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} placeholder="Nome do responsável" />
              </div>
              <div>
                <label style={lbl}>E-mail institucional</label>
                <input style={inp} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="contato@clinica.com" />
              </div>
              <div style={{ gridColumn:"1/-1", display:"flex", gap:"12px", justifyContent:"flex-end" }}>
                <button type="button" onClick={()=>setShowForm(false)} style={{ padding:"11px 24px", border:"1px solid #e5e7eb", background:"white", borderRadius:"9px", fontSize:"14px", cursor:"pointer" }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ padding:"11px 28px", background:"#00885f", color:"white", border:"none", borderRadius:"9px", fontSize:"14px", fontWeight:"700", cursor:"pointer" }}>
                  {saving ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:"64px", color:"#9ca3af" }}>Carregando...</div>
        ) : orgs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px", background:"white", borderRadius:"16px", border:"1px solid #e5e7eb" }}>
            <Building2 size={48} color="#d1d5db" style={{ margin:"0 auto 16px", display:"block" }} />
            <p style={{ fontSize:"18px", fontWeight:"700", color:"#374151", margin:"0 0 8px" }}>Nenhuma organização ainda</p>
            <p style={{ color:"#9ca3af", fontSize:"14px" }}>Cadastre a primeira clínica, prefeitura ou escola.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap:"20px" }}>
            {!selected && orgs.map(org => (
              <div key={org.id} onClick={() => loadDetail(org)}
                style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"24px", cursor:"pointer", transition:"box-shadow 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px" }}>
                  <div>
                    <span style={{ fontSize:"11px", fontWeight:"800", color: tipoColor[org.tipo]||"#6b7280", background:(tipoColor[org.tipo]||"#6b7280")+"15", padding:"3px 10px", borderRadius:"999px", textTransform:"uppercase" }}>
                      {tipoLabel[org.tipo]||org.tipo}
                    </span>
                    <h3 style={{ fontSize:"17px", fontWeight:"800", color:"#071b2c", margin:"10px 0 4px" }}>{org.nome}</h3>
                    {(org.cidade||org.estado) && <p style={{ color:"#6b7280", fontSize:"13px", margin:0 }}>{org.cidade}{org.cidade&&org.estado?" — ":""}{org.estado}</p>}
                  </div>
                  <ChevronRight size={20} color="#9ca3af" />
                </div>
                {org.responsavel && <p style={{ fontSize:"13px", color:"#374151", margin:"0 0 4px" }}>👤 {org.responsavel}</p>}
                {org.email && <p style={{ fontSize:"13px", color:"#2563eb", margin:0 }}>✉ {org.email}</p>}
              </div>
            ))}

            {selected && detail && (
              <div>
                <button onClick={()=>{setSelected(null);setDetail(null);}} style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none", color:"#374151", fontSize:"14px", cursor:"pointer", marginBottom:"24px", fontWeight:"600" }}>
                  ← Voltar para organizações
                </button>
                <div style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"32px", marginBottom:"24px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"16px" }}>
                    <div>
                      <span style={{ fontSize:"11px", fontWeight:"800", color: tipoColor[selected.tipo]||"#6b7280", background:(tipoColor[selected.tipo]||"#6b7280")+"15", padding:"3px 10px", borderRadius:"999px", textTransform:"uppercase" }}>
                        {tipoLabel[selected.tipo]||selected.tipo}
                      </span>
                      <h2 style={{ fontSize:"24px", fontWeight:"800", color:"#071b2c", margin:"12px 0 4px" }}>{selected.nome}</h2>
                      <p style={{ color:"#6b7280", fontSize:"14px", margin:0 }}>{selected.cidade}{selected.cidade&&selected.estado?" — ":""}{selected.estado}{selected.cnpj?" · CNPJ: "+selected.cnpj:""}</p>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"16px", marginTop:"28px" }}>
                    {[
                      [detail.members?.length||0, "Profissionais", Users, "#2563eb"],
                      [detail.stats?.patients||0, "Pacientes", Activity, "#00885f"],
                      [detail.stats?.sessions||0, "Sessões", BarChart3, "#7c3aed"],
                    ].map(([val,label,Icon,color]) => (
                      <div key={label} style={{ background:"#f9fafb", borderRadius:"12px", padding:"20px", textAlign:"center", border:"1px solid #e5e7eb" }}>
                        <Icon size={22} color={color} style={{ margin:"0 auto 8px", display:"block" }} />
                        <div style={{ fontSize:"28px", fontWeight:"800", color:"#071b2c" }}>{val}</div>
                        <div style={{ fontSize:"13px", color:"#6b7280" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {detail.members?.length > 0 && (
                  <div style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"28px" }}>
                    <h3 style={{ fontSize:"16px", fontWeight:"800", color:"#071b2c", margin:"0 0 20px" }}>Profissionais</h3>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ background:"#f9fafb" }}>
                          {["Nome/ID","Função","Entrou em"].map(h => (
                            <th key={h} style={{ padding:"10px 14px", fontSize:"12px", fontWeight:"700", color:"#6b7280", textAlign:"left", borderBottom:"1px solid #e5e7eb", textTransform:"uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.members.map(m => (
                          <tr key={m.id}>
                            <td style={{ padding:"12px 14px", fontSize:"14px", color:"#071b2c", borderBottom:"1px solid #f3f4f6" }}>
                              <div style={{ fontWeight:"600" }}>{m.nome || m.user_id.slice(0,12)+"..."}</div>
                              {m.email && <div style={{ fontSize:"12px", color:"#6b7280" }}>{m.email}</div>}
                            </td>
                            <td style={{ padding:"12px 14px", fontSize:"13px", color:"#374151", borderBottom:"1px solid #f3f4f6" }}>
                              <span style={{ background: m.role==="admin"?"#fef9c3":"#f3f4f6", padding:"3px 10px", borderRadius:"999px", fontSize:"12px", fontWeight:"700" }}>{m.role}</span>
                            </td>
                            <td style={{ padding:"12px 14px", fontSize:"13px", color:"#6b7280", borderBottom:"1px solid #f3f4f6" }}>
                              {new Date(m.joined_at).toLocaleDateString("pt-BR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
