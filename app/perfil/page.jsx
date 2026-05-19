"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function PerfilPage() {
  const { user } = useUser();
  const [form, setForm] = useState({ nome_profissional:"", registro_crfa:"", profissao:"Fonoaudiólogo(a)", conselho_regional:"", telefone:"", assinatura_base64:"" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirVisible, setDirVisible] = useState(false);
  const [dirBio, setDirBio] = useState("");
  const [dirCidade, setDirCidade] = useState("");
  const [dirEstado, setDirEstado] = useState("");
  const [dirOnline, setDirOnline] = useState(false);
  const [dirSaving, setDirSaving] = useState(false);
  const [dirSaved, setDirSaved] = useState(false);
  const [assinaturaPreview, setAssinaturaPreview] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/user-prefs").then(r=>r.json()).then(d => {
      if (d.prefs) {
        setForm(f => ({ ...f, ...d.prefs }));
        if (d.prefs.assinatura_base64) setAssinaturaPreview(d.prefs.assinatura_base64);
      }
    });
  }, []);

  async function uploadAssinatura(file) {
    if (!file) return;
    if (file.size > 1024*1024) { alert("Máximo 1MB para assinatura."); return; }
    const reader = new FileReader();
    reader.onload = e => {
      setAssinaturaPreview(e.target.result);
      setForm(f => ({ ...f, assinatura_base64: e.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function saveDiretorio() {
    setDirSaving(true);
    try {
      await fetch("/api/profissionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visivel: dirVisible,
          bio: dirBio,
          cidade: dirCidade,
          estado: dirEstado,
          atende_online: dirOnline,
        }),
      });
      setDirSaved(true);
      setTimeout(() => setDirSaved(false), 3000);
    } catch {}
    setDirSaving(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/user-prefs", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  }

  const inp = { width:"100%", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"10px 12px", fontSize:"14px", fontFamily:"inherit", boxSizing:"border-box" };
  const lbl = { fontSize:"13px", fontWeight:"700", color:"#374151", display:"block", marginBottom:"6px" };

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e7eb", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/app" style={{ color:"#00885f", fontWeight:"800", textDecoration:"none", fontSize:"18px" }}>CAA Neuro</a>
        <a href="/app" style={{ color:"#6b7280", fontSize:"14px", textDecoration:"none" }}>← Voltar ao app</a>
      </div>

      <div style={{ maxWidth:"640px", margin:"0 auto", padding:"40px 24px" }}>
        <h1 style={{ fontSize:"24px", fontWeight:"800", color:"#071b2c", margin:"0 0 6px" }}>Perfil profissional</h1>
        <p style={{ color:"#6b7280", fontSize:"14px", margin:"0 0 32px" }}>
          Essas informações aparecem nos relatórios e prontuários gerados, conforme exigido pela Resolução CFFa nº 777/2025.
        </p>

        <div style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", padding:"28px" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

            <div>
              <label style={lbl}>Nome completo *</label>
              <input style={inp} value={form.nome_profissional} onChange={e=>setForm({...form,nome_profissional:e.target.value})} placeholder="Seu nome completo" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div>
                <label style={lbl}>Profissão</label>
                <select style={inp} value={form.profissao} onChange={e=>setForm({...form,profissao:e.target.value})}>
                  <option>Fonoaudiólogo(a)</option>
                  <option>Terapeuta Ocupacional</option>
                  <option>Psicólogo(a)</option>
                  <option>Pedagogo(a)</option>
                  <option>Neuropsicopedagogo(a)</option>
                  <option>Educador(a) Especial</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Conselho Regional</label>
                <select style={inp} value={form.conselho_regional} onChange={e=>setForm({...form,conselho_regional:e.target.value})}>
                  <option value="">Selecione</option>
                  {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(uf=><option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div>
                <label style={lbl}>Nº de registro (CRFa / CRP / etc) *</label>
                <input style={inp} value={form.registro_crfa} onChange={e=>setForm({...form,registro_crfa:e.target.value})} placeholder="Ex: CRFa 2-12345" />
                <p style={{ fontSize:"11px", color:"#9ca3af", margin:"4px 0 0" }}>Obrigatório no prontuário eletrônico (Res. CFFa 777/2025)</p>
              </div>
              <div>
                <label style={lbl}>Telefone</label>
                <input style={inp} value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div>
              <label style={lbl}>Assinatura digital (PNG/JPG transparente, max 1MB)</label>
              <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                <div onClick={()=>fileRef.current?.click()} style={{ width:"160px", height:"60px", border:"2px dashed #d1d5db", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", background:"#f9fafb", flexShrink:0 }}>
                  {assinaturaPreview
                    ? <img src={assinaturaPreview} alt="assinatura" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />
                    : <span style={{ fontSize:"12px", color:"#9ca3af", textAlign:"center", padding:"4px" }}>Clique para enviar assinatura</span>}
                </div>
                <div>
                  <button type="button" onClick={()=>fileRef.current?.click()} style={{ border:"1px solid #e5e7eb", background:"white", padding:"8px 16px", borderRadius:"8px", fontSize:"13px", cursor:"pointer", fontWeight:"600" }}>
                    {assinaturaPreview ? "Trocar assinatura" : "Enviar assinatura"}
                  </button>
                  {assinaturaPreview && <button type="button" onClick={()=>{setAssinaturaPreview("");setForm(f=>({...f,assinatura_base64:""}));}} style={{ marginLeft:"8px", border:"none", background:"none", color:"#dc2626", fontSize:"13px", cursor:"pointer" }}>Remover</button>}
                  <p style={{ fontSize:"11px", color:"#9ca3af", margin:"4px 0 0" }}>Aparece no rodapé do PDF do prontuário</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>uploadAssinatura(e.target.files?.[0])} />
            </div>

          </div>

          {/* ── Seção: Diretório de Profissionais ── */}
          <div style={{ marginTop:"32px", background:"linear-gradient(135deg,#071b2c,#0d2d3e)", borderRadius:"16px", padding:"24px", color:"white" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", flexWrap:"wrap", gap:"12px" }}>
              <div>
                <div style={{ fontWeight:"800", fontSize:"16px", color:"#4ec9a0" }}>🌐 Diretório de Profissionais</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)", marginTop:"4px" }}>Apareça para famílias e colegas que buscam especialistas em CAA</div>
              </div>
              <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.7)" }}>{dirVisible ? "Visível" : "Oculto"}</span>
                <div onClick={() => setDirVisible(v => !v)}
                  style={{ width:"44px", height:"24px", borderRadius:"12px", background:dirVisible?"#4ec9a0":"rgba(255,255,255,0.2)", position:"relative", cursor:"pointer", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:"3px", left:dirVisible?"23px":"3px", width:"18px", height:"18px", borderRadius:"50%", background:"white", transition:"left 0.2s" }} />
                </div>
              </label>
            </div>

            {dirVisible && (
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div>
                  <label style={{ fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.6)", display:"block", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Bio / Apresentação</label>
                  <textarea value={dirBio} onChange={e => setDirBio(e.target.value)} rows={3}
                    placeholder="Ex: Fonoaudióloga especializada em TEA e CAA, com 8 anos de experiência clínica..."
                    style={{ width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"12px", color:"white", fontSize:"14px", resize:"vertical", boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 120px", gap:"10px" }}>
                  <div>
                    <label style={{ fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.6)", display:"block", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Cidade</label>
                    <input value={dirCidade} onChange={e => setDirCidade(e.target.value)} placeholder="São Paulo"
                      style={{ width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"11px", color:"white", fontSize:"14px", boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.6)", display:"block", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Estado</label>
                    <select value={dirEstado} onChange={e => setDirEstado(e.target.value)}
                      style={{ width:"100%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"11px", color:"white", fontSize:"14px", boxSizing:"border-box" }}>
                      <option value="">UF</option>
                      {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer" }}>
                  <div onClick={() => setDirOnline(v => !v)}
                    style={{ width:"36px", height:"20px", borderRadius:"10px", background:dirOnline?"#4ec9a0":"rgba(255,255,255,0.2)", position:"relative", cursor:"pointer", transition:"background 0.2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:"2px", left:dirOnline?"18px":"2px", width:"16px", height:"16px", borderRadius:"50%", background:"white", transition:"left 0.2s" }} />
                  </div>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.8)" }}>Atendo online</span>
                </label>
                <button onClick={saveDiretorio} disabled={dirSaving}
                  style={{ background:"#00885f", color:"white", border:"none", borderRadius:"10px", padding:"11px 20px", fontWeight:"700", fontSize:"14px", cursor:"pointer", alignSelf:"flex-start", display:"flex", alignItems:"center", gap:"8px" }}>
                  {dirSaving ? "Salvando..." : "💾 Salvar no diretório"}
                  {dirSaved && <span style={{ color:"#4ec9a0" }}>✅</span>}
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop:"24px", display:"flex", gap:"10px", alignItems:"center" }}>
            <button onClick={save} disabled={saving} style={{ background: saving?"#6ee7b7":"#00885f", color:"white", border:"none", padding:"12px 32px", borderRadius:"10px", fontSize:"15px", fontWeight:"700", cursor:"pointer" }}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </button>
            {saved && <span style={{ color:"#16a34a", fontSize:"14px", fontWeight:"600" }}>✅ Salvo com sucesso!</span>}
          </div>
        </div>

        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"12px", padding:"16px", marginTop:"16px" }}>
          <p style={{ fontSize:"13px", color:"#1e40af", margin:0, lineHeight:"1.6" }}>
            <strong>Resolução CFFa nº 777/2025:</strong> prontuários eletrônicos devem conter nome, profissão e número de inscrição no Conselho Regional. Essas informações serão incluídas automaticamente em todos os PDFs gerados pelo CAA Neuro.
          </p>
        </div>
      </div>
    </div>
  );
}
