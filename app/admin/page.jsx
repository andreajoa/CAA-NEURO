"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const ADMIN_EMAIL = "tdahma2@gmail.com";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress;

  async function loadData() {
    try {
      const [statsRes, logsRes, testRes] = await Promise.all([
        fetch("/api/admin-stats"),
        fetch("/api/logs"),
        fetch("/api/testimonials?admin=1"),
      ]);
      setStats(await statsRes.json());
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
      const testData = await testRes.json();
      setTestimonials(testData.testimonials || []);
    } catch (e) { console.error(e); }
  }

  async function aprovar(id, aprovado) {
    await fetch("/api/testimonials", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, aprovado }) });
    setTestimonials(ts => ts.map(t => t.id === id ? { ...t, aprovado: aprovado ? 1 : 0 } : t));
  }

  async function destacar(id, destaque) {
    await fetch("/api/testimonials", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, destaque }) });
    setTestimonials(ts => ts.map(t => t.id === id ? { ...t, destaque: destaque ? 1 : 0 } : t));
  }

  async function excluir(id) {
    if (!confirm("Excluir este depoimento?")) return;
    await fetch("/api/testimonials", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setTestimonials(ts => ts.filter(t => t.id !== id));
  }

  async function createBackup() {
    setLoading(true);
    try {
      const res = await fetch("/api/backup-auto", { method:"POST" });
      const data = await res.json();
      alert(data.success ? "Backup criado" : data.error || "Erro backup");
    } catch { alert("Erro ao criar backup"); }
    setLoading(false);
  }

  useEffect(() => {
    if (isLoaded && email === ADMIN_EMAIL) loadData();
  }, [isLoaded, email]);

  if (!isLoaded) return <main style={{ padding:40 }}>Carregando...</main>;
  if (email !== ADMIN_EMAIL) return <main style={{ padding:40 }}><h1>Acesso restrito</h1></main>;

  const cell = { padding:"10px 14px", fontSize:"13px", borderBottom:"1px solid #f3f4f6", verticalAlign:"top" };
  const tabBtn = (t) => ({
    padding:"10px 20px", border:"none", background: tab===t ? "#00885f" : "transparent",
    color: tab===t ? "white" : "#374151", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"14px"
  });

  const pendentes = testimonials.filter(t => !t.aprovado);
  const aprovados = testimonials.filter(t => t.aprovado);

  return (
    <main style={{ minHeight:"100vh", background:"#f9fafb", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e7eb", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontWeight:"800", fontSize:"20px", color:"#00885f" }}>CAA Neuro — Admin</div>
        <a href="/pacientes" style={{ color:"#374151", fontSize:"14px" }}>← Voltar para a plataforma</a>
      </div>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ display:"flex", gap:"8px", marginBottom:"32px", flexWrap:"wrap" }}>
          {[["dashboard","Dashboard"],["depoimentos","Depoimentos" + (pendentes.length ? ` (${pendentes.length} pendentes)` : "")],["logs","Logs"]].map(([id,label]) => (
            <button key={id} style={tabBtn(id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === "dashboard" && stats && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"16px", marginBottom:"24px" }}>
              {[
                ["Pacientes", stats.patients],["Sessões", stats.sessions],
                ["Cards", stats.cards],["Imagens", stats.images],
                ["Depoimentos", testimonials.length],["Aprovados", aprovados.length],
              ].map(([label, val]) => (
                <div key={label} style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"20px", textAlign:"center" }}>
                  <div style={{ fontSize:"28px", fontWeight:"800", color:"#071b2c" }}>{val ?? "—"}</div>
                  <div style={{ fontSize:"13px", color:"#6b7280", marginTop:"4px" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <button onClick={createBackup} disabled={loading} style={{ padding:"11px 24px", background:"#00885f", color:"white", border:"none", borderRadius:"9px", fontSize:"14px", fontWeight:"700", cursor:"pointer" }}>
                {loading ? "Criando..." : "Criar backup"}
              </button>
              <button onClick={() => window.open("/api/backup","_blank")} style={{ padding:"11px 24px", border:"1px solid #e5e7eb", background:"white", borderRadius:"9px", fontSize:"14px", cursor:"pointer" }}>
                Baixar backup
              </button>
            </div>
          </div>
        )}

        {tab === "depoimentos" && (
          <div>
            {pendentes.length > 0 && (
              <div style={{ marginBottom:"40px" }}>
                <h2 style={{ fontSize:"18px", fontWeight:"800", color:"#dc2626", margin:"0 0 16px" }}>⏳ Aguardando aprovação ({pendentes.length})</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                  {pendentes.map(t => (
                    <div key={t.id} style={{ background:"white", borderRadius:"14px", border:"2px solid #fca5a5", padding:"20px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px", flexWrap:"wrap" }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                            {t.foto_url && <img src={t.foto_url} alt={t.nome} style={{ width:"40px", height:"40px", borderRadius:"50%", objectFit:"cover" }} />}
                            <div>
                              <div style={{ fontWeight:"800", fontSize:"15px", color:"#071b2c" }}>{t.nome}</div>
                              {(t.profissao || t.cidade) && <div style={{ fontSize:"13px", color:"#6b7280" }}>{t.profissao}{t.profissao && t.cidade ? ` · ` : ""}{t.cidade}</div>}
                            </div>
                          </div>
                          <p style={{ color:"#374151", fontSize:"14px", lineHeight:"1.7", margin:"0 0 8px", background:"#f9fafb", padding:"12px", borderRadius:"8px" }}>{t.texto}</p>
                          <div style={{ fontSize:"12px", color:"#9ca3af" }}>{new Date(t.created_at).toLocaleDateString("pt-BR")}</div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:"8px", minWidth:"140px" }}>
                          <button onClick={() => aprovar(t.id, true)} style={{ padding:"10px", background:"#16a34a", color:"white", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>✅ Aprovar</button>
                          <button onClick={() => destacar(t.id, true)} style={{ padding:"10px", background:"#2563eb", color:"white", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>⭐ Aprovar + Destacar</button>
                          <button onClick={() => excluir(t.id)} style={{ padding:"10px", border:"1px solid #fca5a5", background:"white", color:"#dc2626", borderRadius:"8px", fontSize:"13px", fontWeight:"700", cursor:"pointer" }}>🗑 Excluir</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aprovados.length > 0 && (
              <div>
                <h2 style={{ fontSize:"18px", fontWeight:"800", color:"#15803d", margin:"0 0 16px" }}>✅ Publicados ({aprovados.length})</h2>
                <table style={{ width:"100%", borderCollapse:"collapse", background:"white", borderRadius:"14px", overflow:"hidden", border:"1px solid #e5e7eb" }}>
                  <thead>
                    <tr style={{ background:"#f9fafb" }}>
                      {["Nome","Profissão","Depoimento","Destaque","Ações"].map(h => (
                        <th key={h} style={{ ...cell, fontWeight:"700", color:"#374151", textAlign:"left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aprovados.map(t => (
                      <tr key={t.id}>
                        <td style={cell}><div style={{ fontWeight:"700", fontSize:"13px" }}>{t.nome}</div><div style={{ fontSize:"12px", color:"#6b7280" }}>{t.cidade}</div></td>
                        <td style={cell}><span style={{ fontSize:"13px", color:"#374151" }}>{t.profissao || "—"}</span></td>
                        <td style={{ ...cell, maxWidth:"280px" }}><span style={{ fontSize:"13px", color:"#374151" }}>{t.texto.slice(0,100)}{t.texto.length > 100 ? "..." : ""}</span></td>
                        <td style={cell}>
                          <button onClick={() => destacar(t.id, !t.destaque)} style={{ padding:"5px 12px", borderRadius:"6px", border:"1px solid #e5e7eb", background: t.destaque ? "#fef9c3" : "white", fontSize:"12px", cursor:"pointer" }}>
                            {t.destaque ? "⭐ Sim" : "Não"}
                          </button>
                        </td>
                        <td style={cell}>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button onClick={() => aprovar(t.id, false)} style={{ padding:"5px 10px", borderRadius:"6px", border:"1px solid #e5e7eb", background:"white", fontSize:"12px", cursor:"pointer" }}>Despublicar</button>
                            <button onClick={() => excluir(t.id)} style={{ padding:"5px 10px", borderRadius:"6px", border:"1px solid #fca5a5", background:"white", color:"#dc2626", fontSize:"12px", cursor:"pointer" }}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {testimonials.length === 0 && (
              <div style={{ textAlign:"center", padding:"64px", color:"#9ca3af" }}>Nenhum depoimento recebido ainda.</div>
            )}
          </div>
        )}

        {tab === "logs" && (
          <div style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", overflow:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f9fafb" }}>
                  {["Data","Ação","Recurso","Detalhe"].map(h => <th key={h} style={{ ...cell, fontWeight:"700", color:"#374151", textAlign:"left" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={cell}>{new Date(l.created_at).toLocaleString("pt-BR")}</td>
                    <td style={cell}>{l.acao}</td>
                    <td style={cell}>{l.recurso}</td>
                    <td style={cell}>{l.detalhes}</td>
                  </tr>
                ))}
                {!logs.length && <tr><td colSpan={4} style={{ ...cell, textAlign:"center", color:"#9ca3af" }}>Nenhum log ainda.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
