"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PublicShell from "../../components/PublicShell";

export default function DepoimentosPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome:"", profissao:"", cidade:"", texto:"", foto_url:"" });
  const [fotoPreview, setFotoPreview] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/testimonials")
      .then(r => r.json())
      .then(d => setTestimonials(d.testimonials || []))
      .finally(() => setLoading(false));
  }, []);

  async function uploadFoto(file) {
    if (!file) return;
    setUploadingFoto(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/testimonials/upload", { method:"POST", body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(f => ({ ...f, foto_url: data.url }));
      setFotoPreview(data.url);
    } catch (e) { setError(e.message || "Erro ao enviar foto."); }
    finally { setUploadingFoto(false); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.texto.trim()) { setError("Nome e depoimento são obrigatórios."); return; }
    if (form.texto.trim().length < 20) { setError("Escreva pelo menos 20 caracteres."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/testimonials", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      setForm({ nome:"", profissao:"", cidade:"", texto:"", foto_url:"" });
      setFotoPreview("");
    } catch (e) { setError(e.message || "Erro ao enviar. Tente novamente."); }
    finally { setSending(false); }
  }

  const initials = (nome) => nome?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
  const avatarColors = ["#2563eb","#7c3aed","#059669","#dc2626","#d97706","#0891b2"];
  const avatarColor = (nome) => avatarColors[(nome?.charCodeAt(0)||0) % avatarColors.length];

  const inp = { width:"100%", padding:"10px 12px", borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:"14px", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { fontSize:"13px", fontWeight:"600", color:"#374151", display:"block", marginBottom:"6px" };

  return (
    <PublicShell>
      <div style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"56px 24px" }}>

          <div style={{ textAlign:"center", marginBottom:"56px" }}>
            <div style={{ display:"inline-block", background:"#f0fdf4", color:"#15803d", padding:"6px 18px", borderRadius:"999px", fontSize:"13px", fontWeight:"700", marginBottom:"20px", border:"1px solid #bbf7d0" }}>
              Histórias reais
            </div>
          <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:"800", color:"#1B2D5B", margin:"0 0 16px", lineHeight:"1.15" }}>
            O que dizem os profissionais
          </h1>
          <p style={{ color:"#42515e", fontSize:"18px", margin:"0 0 36px", maxWidth:"560px", marginLeft:"auto", marginRight:"auto", lineHeight:"1.6" }}>
            Fonoaudiólogos, terapeutas e famílias que transformaram o atendimento com o CAA Neuro.
          </p>
          {!showForm && !sent && (
            <button onClick={() => { setShowForm(true); setError(""); }}
              style={{ background:"#C76B4A", color:"white", border:"none", padding:"14px 36px", borderRadius:"10px", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
              Compartilhar minha experiência
            </button>
          )}
        </div>

        {showForm && !sent && (
          <div style={{ background:"white", borderRadius:"20px", border:"1px solid #e5e7eb", padding:"36px", marginBottom:"56px", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize:"22px", fontWeight:"800", color:"#1B2D5B", margin:"0 0 6px" }}>Compartilhe sua experiência</h2>
            <p style={{ color:"#6b7280", fontSize:"14px", margin:"0 0 28px" }}>Seu depoimento será revisado antes de aparecer publicamente. Obrigado por contribuir!</p>

            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
                <div onClick={() => fileRef.current?.click()} style={{ width:"76px", height:"76px", borderRadius:"50%", background:fotoPreview?"transparent":"#f3f4f6", border:"2px dashed #d1d5db", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0 }}>
                  {fotoPreview
                    ? <img src={fotoPreview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <span style={{ fontSize:"28px" }}>📷</span>}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ background:"#f9fafb", border:"1px solid #e5e7eb", padding:"9px 18px", borderRadius:"8px", fontSize:"13px", cursor:"pointer", fontWeight:"600" }}>
                    {uploadingFoto ? "Enviando..." : fotoPreview ? "Trocar foto" : "Adicionar sua foto (opcional)"}
                  </button>
                  <p style={{ fontSize:"12px", color:"#9ca3af", margin:"6px 0 0" }}>JPG, PNG ou WebP · máximo 3MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => uploadFoto(e.target.files?.[0])} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"14px" }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Nome completo *</label>
                  <input style={inp} value={form.nome} onChange={e => setForm({...form,nome:e.target.value})} placeholder="Seu nome" required />
                </div>
                <div>
                  <label style={lbl}>Profissão</label>
                  <input style={inp} value={form.profissao} onChange={e => setForm({...form,profissao:e.target.value})} placeholder="Ex: Fonoaudióloga" />
                </div>
                <div>
                  <label style={lbl}>Cidade / Estado</label>
                  <input style={inp} value={form.cidade} onChange={e => setForm({...form,cidade:e.target.value})} placeholder="Ex: São Paulo, SP" />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Seu depoimento *</label>
                  <textarea style={{ ...inp, resize:"vertical" }} rows={5} value={form.texto} onChange={e => setForm({...form,texto:e.target.value})} required
                    placeholder="Como o CAA Neuro transformou seu atendimento? Qual foi o impacto para seus pacientes?" />
                  <p style={{ fontSize:"12px", color: form.texto.length < 20 ? "#f59e0b" : "#9ca3af", margin:"4px 0 0" }}>
                    {form.texto.length} caracteres {form.texto.length < 20 ? `(mínimo 20)` : "✓"}
                  </p>
                </div>
              </div>

              {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", padding:"12px", fontSize:"13px", color:"#dc2626" }}>{error}</div>}

              <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end", flexWrap:"wrap" }}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding:"11px 24px", borderRadius:"9px", border:"1px solid #e5e7eb", background:"white", fontSize:"14px", cursor:"pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={sending}
                  style={{ padding:"11px 32px", borderRadius:"9px", background:sending?"#E8B4A8":"#C76B4A", color:"white", border:"none", fontSize:"14px", fontWeight:"700", cursor:sending?"wait":"pointer" }}>
                  {sending ? "Enviando..." : "Enviar depoimento"}
                </button>
              </div>
            </form>
          </div>
        )}

        {sent && (
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"20px", padding:"40px", textAlign:"center", marginBottom:"56px" }}>
            <div style={{ fontSize:"52px", marginBottom:"16px" }}>🎉</div>
            <h3 style={{ fontSize:"22px", fontWeight:"800", color:"#15803d", margin:"0 0 10px" }}>Depoimento enviado!</h3>
            <p style={{ color:"#166534", margin:"0 0 20px", fontSize:"15px" }}>Obrigado! Vamos revisar e publicar em breve.</p>
            <button onClick={() => { setSent(false); setShowForm(false); }}
              style={{ background:"#16a34a", color:"white", border:"none", padding:"11px 28px", borderRadius:"9px", fontSize:"14px", fontWeight:"700", cursor:"pointer" }}>
              Fechar
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:"64px", color:"#9ca3af", fontSize:"15px" }}>Carregando depoimentos...</div>
        ) : testimonials.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 24px" }}>
            <div style={{ fontSize:"52px", marginBottom:"16px" }}>💬</div>
            <p style={{ fontSize:"20px", fontWeight:"700", color:"#374151", margin:"0 0 8px" }}>Seja o primeiro a compartilhar!</p>
            <p style={{ color:"#9ca3af", fontSize:"15px" }}>Ainda não há depoimentos publicados.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"24px" }}>
            {testimonials.map(t => (
              <div key={t.id} style={{ background:"white", borderRadius:"18px", border: t.destaque ? "2px solid #C76B4A" : "1px solid #e5e7eb", padding:"28px", display:"flex", flexDirection:"column", gap:"16px", position:"relative" }}>
                {t.destaque && (
                  <div style={{ position:"absolute", top:"-1px", right:"18px", background:"#C76B4A", color:"white", fontSize:"11px", fontWeight:"800", padding:"4px 12px", borderRadius:"0 0 10px 10px" }}>
                    ⭐ Destaque
                  </div>
                )}
                <div style={{ fontSize:"36px", color:"#d1fae5", lineHeight:1 }}>"</div>
                <p style={{ color:"#374151", fontSize:"15px", lineHeight:"1.75", margin:0, flex:1 }}>{t.texto}</p>
                <div style={{ display:"flex", alignItems:"center", gap:"12px", borderTop:"1px solid #f3f4f6", paddingTop:"18px" }}>
                  {t.foto_url
                    ? <img src={t.foto_url} alt={t.nome} style={{ width:"46px", height:"46px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                    : <div style={{ width:"46px", height:"46px", borderRadius:"50%", background:avatarColor(t.nome), display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:"800", fontSize:"16px", flexShrink:0 }}>
                        {initials(t.nome)}
                      </div>
                  }
                  <div>
                    <div style={{ fontWeight:"800", fontSize:"14px", color:"#1B2D5B" }}>{t.nome}</div>
                    {(t.profissao || t.cidade) && <div style={{ fontSize:"13px", color:"#6b7280" }}>{t.profissao}{t.profissao && t.cidade ? ` · ${t.cidade}` : t.cidade}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:"72px", padding:"52px 32px", background:"white", borderRadius:"20px", border:"1px solid #e5e7eb" }}>
          <h2 style={{ fontSize:"26px", fontWeight:"800", color:"#1B2D5B", margin:"0 0 12px" }}>Pronto para transformar seu atendimento?</h2>
          <p style={{ color:"#6b7280", margin:"0 0 28px", fontSize:"16px" }}>Junte-se a centenas de profissionais que já usam o CAA Neuro.</p>
          <Link href="/sign-up" style={{ background:"#C76B4A", color:"white", padding:"15px 36px", borderRadius:"10px", textDecoration:"none", fontSize:"16px", fontWeight:"700", display:"inline-block" }}>
            Começar gratuitamente →
          </Link>
        </div>
      </div>
    </div>
    </PublicShell>
  );
}
