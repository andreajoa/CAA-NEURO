"use client";
import { useState, useEffect } from "react";

const steps = [
  { icon:"👤", title:"Cadastre seu primeiro paciente", desc:"Acesse 'Pacientes' e crie o prontuário com diagnóstico, objetivos terapêuticos e responsável.", href:"/pacientes" },
  { icon:"🗂️", title:"Escolha o perfil e nível linguístico", desc:"Na prancha, selecione o perfil (Infantil, Adulto...) e o nível linguístico adequado para o paciente.", href:"/app" },
  { icon:"🖼️", title:"Personalize os cards", desc:"Clique em 'Editar prancha' e busque nos 45.000+ pictogramas ARASAAC ou gere imagens únicas com IA.", href:"/app" },
  { icon:"📝", title:"Registre a sessão", desc:"Após o atendimento, registre evolução e objetivos. A IA analisa o histórico e gera insights clínicos.", href:"/pacientes" },
  { icon:"📄", title:"Exporte relatórios", desc:"Baixe PDF profissional ou exporte para Excel/CSV direto do prontuário do paciente.", href:"/pacientes" },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(true);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/user-prefs")
      .then(r => r.json())
      .then(d => {
        const isDone = d.prefs?.onboarding_done === 1;
        setDone(isDone);
        setVisible(!isDone);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function finish() {
    setVisible(false);
    setDone(true);
    await fetch("/api/user-prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarding_done: true }),
    }).catch(() => {});
  }

  if (!loaded) return null;

  const curr = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <>
      {done && (
        <button
          onClick={() => { setVisible(true); setStep(0); }}
          title="Guia de início"
          style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:200, background:"#00885f", color:"white", border:"none", borderRadius:"50%", width:"50px", height:"50px", fontSize:"22px", cursor:"pointer", boxShadow:"0 4px 16px rgba(0,136,95,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}
        >?</button>
      )}

      {visible && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
          <div style={{ background:"white", borderRadius:"22px", padding:"40px", maxWidth:"480px", width:"100%", position:"relative" }}>
            <button onClick={finish} style={{ position:"absolute", top:"16px", right:"16px", background:"#f3f4f6", border:"none", width:"34px", height:"34px", borderRadius:"50%", fontSize:"18px", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>

            <div style={{ display:"flex", gap:"6px", marginBottom:"32px" }}>
              {steps.map((_,i) => (
                <div key={i} onClick={() => setStep(i)} style={{ flex:1, height:"5px", borderRadius:"3px", background: i <= step ? "#00885f" : "#e5e7eb", cursor:"pointer", transition:"background 0.3s" }} />
              ))}
            </div>

            <div style={{ textAlign:"center", marginBottom:"32px" }}>
              <div style={{ fontSize:"52px", marginBottom:"16px" }}>{curr.icon}</div>
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#00885f", marginBottom:"10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                Passo {step + 1} de {steps.length}
              </div>
              <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#071b2c", margin:"0 0 12px" }}>{curr.title}</h2>
              <p style={{ color:"#42515e", fontSize:"15px", lineHeight:"1.65", margin:0 }}>{curr.desc}</p>
            </div>

            <div style={{ display:"flex", gap:"10px" }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s-1)} style={{ flex:1, padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", background:"white", fontSize:"14px", cursor:"pointer", fontWeight:"600" }}>
                  ← Anterior
                </button>
              )}
              {!isLast ? (
                <button onClick={() => setStep(s => s+1)} style={{ flex:2, padding:"12px", borderRadius:"10px", background:"#00885f", color:"white", border:"none", fontSize:"14px", cursor:"pointer", fontWeight:"700" }}>
                  Próximo →
                </button>
              ) : (
                <a href={curr.href} onClick={finish} style={{ flex:2, padding:"12px", borderRadius:"10px", background:"#00885f", color:"white", border:"none", fontSize:"14px", cursor:"pointer", fontWeight:"700", textDecoration:"none", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  Começar agora 🚀
                </a>
              )}
            </div>

            <button onClick={finish} style={{ display:"block", margin:"16px auto 0", background:"none", border:"none", color:"#9ca3af", fontSize:"13px", cursor:"pointer", textDecoration:"underline" }}>
              Pular introdução
            </button>
          </div>
        </div>
      )}
    </>
  );
}
