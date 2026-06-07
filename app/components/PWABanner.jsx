"use client";
import { useState, useEffect } from "react";

export default function PWABanner() {
  const [show,     setShow]     = useState(false);
  const [os,       setOs]       = useState(null);
  const [step,     setStep]     = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const ua = navigator.userAgent;
    const isIos     = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (!isIos && !isAndroid) return;
    setOs(isIos ? "ios" : "android");
    setShow(true);
    const today = new Date().toISOString().slice(0,10);
    const last  = localStorage.getItem("pwa-modal-shown");
    if (last !== today) {
      setExpanded(true);
      localStorage.setItem("pwa-modal-shown", today);
    }
  }, []);

  function dismiss() { setExpanded(false); }
  function open()    { setExpanded(true); setStep(0); }

  if (!show) return null;

  const stepsIos = [
    { icon:"🌐", title:"Abra no Safari", desc:'Este app só pode ser instalado pelo Safari. Se estiver em outro navegador, copie o endereço e abra no Safari.' },
    { icon:"⬆️", title:'Toque em "Compartilhar"', desc:'Na barra inferior do Safari, toque no ícone com uma seta para cima (□↑).' },
    { icon:"➕", title:'"Adicionar à Tela de Início"', desc:'Role a lista de opções e toque em "Adicionar à Tela de Início".' },
    { icon:"✅", title:"Toque em Adicionar", desc:'Confirme tocando em "Adicionar" no canto superior direito. O ícone do CAA Neuro aparece na sua tela inicial!' },
  ];

  const stepsAndroid = [
    { icon:"🌐", title:"Abra no Chrome", desc:'Este app deve ser instalado pelo Chrome. Se estiver em outro navegador, copie o endereço e abra no Chrome.' },
    { icon:"⋮", title:"Toque nos três pontos", desc:'No canto superior direito do Chrome, toque nos três pontinhos (⋮) para abrir o menu.' },
    { icon:"📲", title:'"Adicionar à tela inicial"', desc:'Toque em "Adicionar à tela inicial" ou "Instalar aplicativo" — pode aparecer qualquer um dos dois.' },
    { icon:"✅", title:"Confirme a instalação", desc:'Toque em "Adicionar" ou "Instalar". O ícone do CAA Neuro aparece na sua tela inicial!' },
  ];

  const steps  = os === "ios" ? stepsIos : stepsAndroid;
  const curr   = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <>
      {!expanded && (
        <button onClick={open} style={{
          position:"fixed", bottom:"80px", right:"16px", zIndex:300,
          background:"#C76B4A", color:"white", border:"none",
          borderRadius:"50px", padding:"12px 18px",
          display:"flex", alignItems:"center", gap:"8px",
          fontWeight:"800", fontSize:"13px", cursor:"pointer",
          boxShadow:"0 4px 20px rgba(199,107,74,0.5)",
          animation:"pulseBtn 2s ease-in-out infinite"
        }}>
          📲 Instalar app
        </button>
      )}

      {expanded && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.65)",
          display:"flex", alignItems:"flex-end", justifyContent:"center"
        }}>
          <div style={{
            background:"white", borderRadius:"24px 24px 0 0",
            padding:"28px 24px 40px", width:"100%", maxWidth:"480px",
            position:"relative", maxHeight:"90vh", overflowY:"auto"
          }}>
            <button onClick={dismiss} style={{
              position:"absolute", top:"16px", right:"16px",
              background:"#f3f4f6", border:"none", borderRadius:"50%",
              width:"32px", height:"32px", fontSize:"16px",
              cursor:"pointer", color:"#6b7280",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}>✕</button>

            <div style={{width:"40px",height:"4px",background:"#e5e7eb",borderRadius:"2px",margin:"0 auto 20px"}} />

            <div style={{textAlign:"center", marginBottom:"24px"}}>
              <div style={{fontSize:"40px", marginBottom:"8px"}}>📲</div>
              <h2 style={{fontSize:"20px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 6px"}}>
                Instale o CAA Neuro
              </h2>
              <p style={{color:"#6b7280",fontSize:"14px",margin:0,lineHeight:"1.5"}}>
                Use como app no celular — sem abrir o navegador toda vez
              </p>
            </div>

            <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"24px"}}>
              {steps.map((_,i) => (
                <div key={i} onClick={() => setStep(i)} style={{
                  width:i===step?"24px":"8px", height:"8px",
                  borderRadius:"4px",
                  background:i===step?"#C76B4A":i<step?"#E8B4A8":"#e5e7eb",
                  cursor:"pointer", transition:"all 0.3s"
                }} />
              ))}
            </div>

            <div style={{
              background:"#FFF5F2", borderRadius:"16px",
              padding:"24px", marginBottom:"20px", textAlign:"center",
              border:"2px solid #E8B4A8"
            }}>
              <div style={{fontSize:"48px", marginBottom:"12px"}}>{curr.icon}</div>
              <div style={{
                fontSize:"11px", fontWeight:"700", color:"#C76B4A",
                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px"
              }}>
                Passo {step+1} de {steps.length}
              </div>
              <h3 style={{fontSize:"17px",fontWeight:"800",color:"#1B2D5B",margin:"0 0 10px"}}>
                {curr.title}
              </h3>
              <p style={{color:"#42515e",fontSize:"14px",lineHeight:"1.65",margin:0}}>
                {curr.desc}
              </p>
            </div>

            <div style={{display:"flex",gap:"10px"}}>
              {step > 0 && (
                <button onClick={() => setStep(s=>s-1)} style={{
                  flex:1, padding:"12px", borderRadius:"10px",
                  border:"1px solid #e5e7eb", background:"white",
                  fontSize:"14px", cursor:"pointer", fontWeight:"600", color:"#374151"
                }}>← Anterior</button>
              )}
              {!isLast ? (
                <button onClick={() => setStep(s=>s+1)} style={{
                  flex:2, padding:"12px", borderRadius:"10px",
                  background:"#C76B4A", color:"white", border:"none",
                  fontSize:"14px", cursor:"pointer", fontWeight:"700"
                }}>Próximo →</button>
              ) : (
                <button onClick={dismiss} style={{
                  flex:2, padding:"12px", borderRadius:"10px",
                  background:"#1B2D5B", color:"white", border:"none",
                  fontSize:"14px", cursor:"pointer", fontWeight:"700"
                }}>✅ Entendi, vou instalar!</button>
              )}
            </div>

            <button onClick={dismiss} style={{
              display:"block", margin:"14px auto 0",
              background:"none", border:"none",
              color:"#9ca3af", fontSize:"13px",
              cursor:"pointer", textDecoration:"underline"
            }}>Agora não</button>
          </div>
        </div>
      )}
    </>
  );
}
