"use client";
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";

const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function AgendaPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoje] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [diaSel, setDiaSel] = useState(new Date().getDate());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo:"", paciente:"", horario:"08:00", duracao:"60", data:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/agenda").then(r=>r.json())
      .then(d => setEventos(d.eventos || d.agenda || []))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const diasNoMes = new Date(anoAtual, mesAtual+1, 0).getDate();
  const cells = Array(primeiroDia).fill(null).concat(Array.from({length:diasNoMes},(_,i)=>i+1));

  const eventosDia = (dia) => eventos.filter(e => {
    const d = new Date(e.data || e.horario || e.created_at);
    return d.getDate()===dia && d.getMonth()===mesAtual && d.getFullYear()===anoAtual;
  });

  const eventosSel = eventosDia(diaSel);

  async function salvar() {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const dataStr = form.data || `${anoAtual}-${String(mesAtual+1).padStart(2,"0")}-${String(diaSel).padStart(2,"0")}`;
      const res = await fetch("/api/agenda", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, data: dataStr })
      });
      const d = await res.json();
      setEventos(ev => [...ev, d.evento || { ...form, id: Date.now(), data: dataStr }]);
      setForm({ titulo:"", paciente:"", horario:"08:00", duracao:"60", data:"" });
      setShowForm(false);
    } catch {}
    setSaving(false);
  }

  const inp = { width:"100%", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"10px 12px", fontSize:"14px", boxSizing:"border-box", outline:"none", fontFamily:"inherit" };

  return (
    <AppShell>
      <div style={{ padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ margin:0, fontSize:"26px", fontWeight:"800", color:"#071b2c" }}>📅 Agenda</h1>
            <p style={{ margin:"4px 0 0", color:"#6b7280", fontSize:"14px" }}>{MESES[mesAtual]} {anoAtual}</p>
          </div>
          <button onClick={()=>setShowForm(s=>!s)}
            style={{ background:"#00885f", color:"white", border:"none", padding:"10px 20px", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontSize:"14px" }}>
            + Novo agendamento
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"24px", alignItems:"start" }}>
          {/* Calendário */}
          <div style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", overflow:"hidden" }}>
            {/* Controles de mês */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6" }}>
              <button onClick={()=>{ if(mesAtual===0){setMesAtual(11);setAnoAtual(a=>a-1);}else setMesAtual(m=>m-1); }}
                style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", fontWeight:"700" }}>←</button>
              <span style={{ fontWeight:"800", fontSize:"16px", color:"#071b2c" }}>{MESES[mesAtual]} {anoAtual}</span>
              <button onClick={()=>{ if(mesAtual===11){setMesAtual(0);setAnoAtual(a=>a+1);}else setMesAtual(m=>m+1); }}
                style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", fontWeight:"700" }}>→</button>
            </div>

            {/* Dias da semana */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 12px" }}>
              {DIAS.map(d => (
                <div key={d} style={{ textAlign:"center", padding:"10px 4px", fontSize:"11px", fontWeight:"700", color:"#9ca3af", textTransform:"uppercase" }}>{d}</div>
              ))}
            </div>

            {/* Células */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 12px 16px", gap:"4px" }}>
              {cells.map((dia, i) => {
                if (!dia) return <div key={i} />;
                const isHoje = dia===hoje.getDate()&&mesAtual===hoje.getMonth()&&anoAtual===hoje.getFullYear();
                const isSel = dia===diaSel;
                const temEvento = eventosDia(dia).length > 0;
                return (
                  <button key={i} onClick={()=>setDiaSel(dia)}
                    style={{
                      aspectRatio:"1", borderRadius:"10px", border:"none", cursor:"pointer", fontSize:"14px", fontWeight: isHoje||isSel?"800":"500",
                      background: isSel?"#00885f": isHoje?"#f0fdf4":"transparent",
                      color: isSel?"white": isHoje?"#00885f":"#374151",
                      position:"relative", transition:"all 0.1s",
                    }}>
                    {dia}
                    {temEvento && <span style={{ position:"absolute", bottom:"4px", left:"50%", transform:"translateX(-50%)", width:"5px", height:"5px", borderRadius:"50%", background: isSel?"rgba(255,255,255,0.8)":"#00885f", display:"block" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel direito */}
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {/* Form novo evento */}
            {showForm && (
              <div style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"20px" }}>
                <h3 style={{ margin:"0 0 16px", fontSize:"15px", fontWeight:"800", color:"#071b2c" }}>Novo agendamento</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <input placeholder="Título *" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} style={inp} />
                  <input placeholder="Paciente" value={form.paciente} onChange={e=>setForm(f=>({...f,paciente:e.target.value}))} style={inp} />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                    <input type="time" value={form.horario} onChange={e=>setForm(f=>({...f,horario:e.target.value}))} style={inp} />
                    <select value={form.duracao} onChange={e=>setForm(f=>({...f,duracao:e.target.value}))} style={inp}>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                      <option value="120">2 horas</option>
                    </select>
                  </div>
                  <input type="date" value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}
                    style={inp} placeholder="Data (padrão: dia selecionado)" />
                  <div style={{ display:"flex", gap:"8px" }}>
                    <button onClick={salvar} disabled={saving||!form.titulo.trim()}
                      style={{ flex:1, background:"#00885f", color:"white", border:"none", padding:"10px", borderRadius:"8px", fontWeight:"700", cursor:"pointer", fontSize:"14px", opacity:saving||!form.titulo.trim()?0.6:1 }}>
                      {saving?"Salvando...":"Salvar"}
                    </button>
                    <button onClick={()=>setShowForm(false)}
                      style={{ background:"#f9fafb", border:"1px solid #e5e7eb", color:"#374151", padding:"10px 14px", borderRadius:"8px", cursor:"pointer", fontWeight:"600" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Eventos do dia selecionado */}
            <div style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"20px" }}>
              <h3 style={{ margin:"0 0 14px", fontSize:"15px", fontWeight:"800", color:"#071b2c" }}>
                {DIAS[new Date(anoAtual,mesAtual,diaSel).getDay()]}, {diaSel} de {MESES[mesAtual]}
              </h3>
              {loading ? (
                <p style={{ color:"#9ca3af", fontSize:"14px" }}>Carregando...</p>
              ) : eventosSel.length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 0" }}>
                  <div style={{ fontSize:"32px", marginBottom:"8px" }}>📭</div>
                  <p style={{ color:"#9ca3af", fontSize:"13px", margin:0 }}>Nenhum agendamento</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {eventosSel.map((e,i) => (
                    <div key={e.id||i} style={{ background:"#f0fdf4", borderLeft:"3px solid #00885f", borderRadius:"8px", padding:"10px 14px" }}>
                      <div style={{ fontWeight:"700", fontSize:"14px", color:"#071b2c" }}>{e.titulo||e.title||"Sessão"}</div>
                      <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"2px" }}>
                        {e.horario||e.hora||""}{e.paciente ? ` · ${e.paciente}` : ""}{e.duracao ? ` · ${e.duracao}min` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
