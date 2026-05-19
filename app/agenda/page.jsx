"use client";
import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";

const DIAS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function addMinutes(time, minutes) {
  const [h, m] = String(time || "08:00").split(":").map(Number);
  const total = (h * 60) + m + Number(minutes || 0);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${pad(hh)}:${pad(mm)}`;
}

function toGoogleDate(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function escapeICS(s) {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function downloadICS(ev) {
  const start = `${ev.data}T${ev.hora_inicio || "08:00"}:00`;
  const end = `${ev.data}T${ev.hora_fim || addMinutes(ev.hora_inicio || "08:00", 60)}:00`;
  const dtStart = new Date(start);
  const dtEnd = new Date(end);

  const fmt = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const title = ev.titulo || "Sessão";
  const details = [
    ev.paciente_nome ? `Paciente: ${ev.paciente_nome}` : "",
    ev.tipo ? `Tipo: ${ev.tipo}` : "",
    ev.notas ? `Notas: ${ev.notas}` : "",
    ev.share_token ? `Prancha: https://www.adhdautism.online/prancha/${ev.share_token}` : "",
  ].filter(Boolean).join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CAA Neuro//Agenda//PT-BR",
    "BEGIN:VEVENT",
    `UID:agenda-${ev.id || Date.now()}@caa-neuro`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(title || "agendamento").toLowerCase().replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function googleCalendarUrl(ev) {
  const start = toGoogleDate(ev.data, ev.hora_inicio || "08:00");
  const end = toGoogleDate(ev.data, ev.hora_fim || addMinutes(ev.hora_inicio || "08:00", 60));
  const text = encodeURIComponent(ev.titulo || "Sessão");
  const details = encodeURIComponent(
    [
      ev.paciente_nome ? `Paciente: ${ev.paciente_nome}` : "",
      ev.tipo ? `Tipo: ${ev.tipo}` : "",
      ev.notas ? `Notas: ${ev.notas}` : "",
    ].filter(Boolean).join("\n")
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoje] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [diaSel, setDiaSel] = useState(new Date().getDate());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titulo:"",
    patient_id:"",
    paciente_nome:"",
    hora_inicio:"08:00",
    duracao:"60",
    data:"",
    tipo:"sessao",
    notas:"",
    share_token:"",
  });
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetch("/api/agenda").then(r=>r.json())
      .then(d => setEventos(d.eventos || d.agenda || []))
      .catch(()=>{})
      .finally(()=>setLoading(false));

    fetch("/api/templates").then(r=>r.json())
      .then(d => setTemplates(d.templates || []))
      .catch(()=>{});
  }, []);

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const diasNoMes = new Date(anoAtual, mesAtual+1, 0).getDate();
  const cells = Array(primeiroDia).fill(null).concat(Array.from({length:diasNoMes},(_,i)=>i+1));

  const eventosDia = (dia) => eventos.filter(e => {
    const d = new Date(`${e.data}T${e.hora_inicio || "00:00"}:00`);
    return d.getDate()===dia && d.getMonth()===mesAtual && d.getFullYear()===anoAtual;
  });

  const eventosSel = eventosDia(diaSel);

  async function salvar() {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const dataStr = form.data || `${anoAtual}-${pad(mesAtual+1)}-${pad(diaSel)}`;
      const hora_fim = addMinutes(form.hora_inicio, Number(form.duracao || 60));

      let share_token = "";
      if (form.titulo.trim()) {
        const shareRes = await fetch("/api/share", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            profile:"personalizado",
            level:"emergente",
            cards:[{
              id:"agenda-card",
              label: form.titulo.trim(),
              image:"",
              cat:"core",
              empty:true
            }],
            title: form.titulo.trim()
          })
        });
        const shareData = await shareRes.json().catch(() => ({}));
        share_token = shareData.token || "";
      }

      const payload = {
        titulo: form.titulo,
        patient_id: form.patient_id || null,
        data: dataStr,
        hora_inicio: form.hora_inicio,
        hora_fim,
        tipo: form.tipo || "sessao",
        notas: JSON.stringify({
          texto: form.notas || "",
          paciente_nome: form.paciente_nome || "",
          share_token,
        }),
      };

      const res = await fetch("/api/agenda", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      const novo = {
        id: d.id || Date.now(),
        ...payload,
        paciente_nome: form.paciente_nome || "",
        share_token,
        notas_texto: form.notas || "",
      };
      setEventos(ev => [...ev, novo]);
      setForm({
        titulo:"",
        patient_id:"",
        paciente_nome:"",
        hora_inicio:"08:00",
        duracao:"60",
        data:"",
        tipo:"sessao",
        notas:"",
        share_token:"",
      });
      setShowForm(false);
    } catch {}
    setSaving(false);
  }

  function parseNotas(e) {
    try {
      const obj = typeof e.notas === "string" ? JSON.parse(e.notas) : (e.notas || {});
      return {
        texto: obj.texto || "",
        paciente_nome: e.paciente_nome || obj.paciente_nome || "",
        share_token: obj.share_token || "",
      };
    } catch {
      return {
        texto: typeof e.notas === "string" ? e.notas : "",
        paciente_nome: e.paciente_nome || "",
        share_token: "",
      };
    }
  }

  const inp = { width:"100%", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"10px 12px", fontSize:"14px", boxSizing:"border-box", outline:"none", fontFamily:"inherit" };

  return (
    <AppShell>
      <div style={{ padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ margin:0, fontSize:"26px", fontWeight:"800", color:"#071b2c" }}>📅 Agenda clínica</h1>
            <p style={{ margin:"4px 0 0", color:"#6b7280", fontSize:"14px" }}>{MESES[mesAtual]} {anoAtual} · Sessões, pacientes e pranchas</p>
          </div>
          <button onClick={()=>setShowForm(s=>!s)}
            style={{ background:"#00885f", color:"white", border:"none", padding:"10px 20px", borderRadius:"10px", fontWeight:"700", cursor:"pointer", fontSize:"14px" }}>
            + Novo agendamento
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"24px", alignItems:"start" }}>
          <div style={{ background:"white", borderRadius:"16px", border:"1px solid #e5e7eb", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6" }}>
              <button onClick={()=>{ if(mesAtual===0){setMesAtual(11);setAnoAtual(a=>a-1);}else setMesAtual(m=>m-1); }}
                style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", fontWeight:"700" }}>←</button>
              <span style={{ fontWeight:"800", fontSize:"16px", color:"#071b2c" }}>{MESES[mesAtual]} {anoAtual}</span>
              <button onClick={()=>{ if(mesAtual===11){setMesAtual(0);setAnoAtual(a=>a+1);}else setMesAtual(m=>m+1); }}
                style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", fontWeight:"700" }}>→</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 12px" }}>
              {DIAS.map(d => (
                <div key={d} style={{ textAlign:"center", padding:"10px 4px", fontSize:"11px", fontWeight:"700", color:"#9ca3af", textTransform:"uppercase" }}>{d}</div>
              ))}
            </div>

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

          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {showForm && (
              <div style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"20px" }}>
                <h3 style={{ margin:"0 0 16px", fontSize:"15px", fontWeight:"800", color:"#071b2c" }}>Novo agendamento</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <input placeholder="Título *" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} style={inp} />
                  <input placeholder="Nome do paciente" value={form.paciente_nome} onChange={e=>setForm(f=>({...f,paciente_nome:e.target.value}))} style={inp} />
                  <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} style={inp}>
                    <option value="sessao">Sessão</option>
                    <option value="avaliacao">Avaliação</option>
                    <option value="retorno">Retorno</option>
                    <option value="orientacao">Orientação familiar</option>
                    <option value="supervisao">Supervisão</option>
                  </select>
                  <div style={{ fontSize:"12px", color:"#6b7280", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"8px", padding:"10px 12px" }}>
                    Uma prancha compartilhada será gerada automaticamente ao salvar este agendamento.
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                    <input type="time" value={form.hora_inicio} onChange={e=>setForm(f=>({...f,hora_inicio:e.target.value}))} style={inp} />
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
                  <textarea placeholder="Notas clínicas / objetivo da sessão"
                    value={form.notas}
                    onChange={e=>setForm(f=>({...f,notas:e.target.value}))}
                    rows={4}
                    style={{...inp, resize:"vertical"}} />
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
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {eventosSel.map((e,i) => {
                    const meta = parseNotas(e);
                    return (
                      <div key={e.id||i} style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"10px", padding:"12px 14px" }}>
                        <div style={{ fontWeight:"700", fontSize:"14px", color:"#071b2c" }}>{e.titulo || "Sessão"}</div>
                        <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"4px", lineHeight:"1.5" }}>
                          {(e.hora_inicio || "")}{e.hora_fim ? ` - ${e.hora_fim}` : ""}
                          {meta.paciente_nome ? ` · ${meta.paciente_nome}` : ""}
                          {e.tipo ? ` · ${e.tipo}` : ""}
                        </div>
                        {meta.texto && (
                          <div style={{ fontSize:"12px", color:"#374151", marginTop:"8px", lineHeight:"1.5" }}>
                            {meta.texto}
                          </div>
                        )}
                        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"10px" }}>
                          {meta.share_token && (
                            <a
                              href={`https://www.adhdautism.online/prancha/${meta.share_token}`}
                              style={{ background:"white", color:"#00885f", border:"1px solid #bbf7d0", padding:"7px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:"700", textDecoration:"none" }}
                            >
                              Abrir prancha
                            </a>
                          )}
                          <a
                            href={googleCalendarUrl({ ...e, paciente_nome: meta.paciente_nome, notas: meta.texto })}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ background:"white", color:"#2563eb", border:"1px solid #bfdbfe", padding:"7px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:"700", textDecoration:"none" }}
                          >
                            Google Agenda
                          </a>
                          <button
                            onClick={() => downloadICS({ ...e, paciente_nome: meta.paciente_nome, notas: meta.texto, share_token: meta.share_token })}
                            style={{ background:"white", color:"#374151", border:"1px solid #e5e7eb", padding:"7px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:"700", cursor:"pointer" }}
                          >
                            Baixar .ics
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
