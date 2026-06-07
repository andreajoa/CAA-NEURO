"use client";
import { useState, useEffect } from "react";

export default function PwaUpdateBanner() {
  const [show, setShow]       = useState(false);
  const [os, setOs]           = useState(null); // "ios" | "android" | null
  const [step, setStep]       = useState(0);    // 0=banner, 1=instrucoes

  useEffect(() => {
    // Só mostra se já foi instalado como PWA (standalone)
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
    if (!isInstalled) return;

    // Só mostra uma vez — salva no localStorage
    const dismissed = localStorage.getItem("pwa-update-v4-dismissed");
    if (dismissed) return;

    // Detecta OS
    const ua = navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua)) setOs("ios");
    else if (/android/i.test(ua))      setOs("android");
    else                               setOs("android"); // fallback genérico

    setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-update-v4-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  const STEPS_IOS = [
    { emoji: "🗑️", text: 'Pressione o ícone do CAA Neuro na tela inicial e toque em "Remover App"' },
    { emoji: "🌐", text: 'Abra o Safari e acesse adhdautism.online' },
    { emoji: "⬆️", text: 'Toque no botão de compartilhar (□↑) na barra inferior' },
    { emoji: "➕", text: 'Toque em "Adicionar à Tela de Início" e confirme' },
    { emoji: "✅", text: "Pronto! O novo ícone já aparece na tela inicial" },
  ];

  const STEPS_ANDROID = [
    { emoji: "🗑️", text: 'Pressione o ícone do CAA Neuro e toque em "Desinstalar"' },
    { emoji: "🌐", text: 'Abra o Chrome e acesse adhdautism.online' },
    { emoji: "📲", text: 'O Chrome vai mostrar um banner "Instalar app" — toque nele' },
    { emoji: "➕", text: 'Se o banner não aparecer: toque nos 3 pontos ⋮ → "Adicionar à tela inicial"' },
    { emoji: "✅", text: "Pronto! O novo ícone já aparece na tela inicial" },
  ];

  const steps = os === "ios" ? STEPS_IOS : STEPS_ANDROID;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: "white",
      borderTop: "3px solid #C76B4A",
      borderRadius: "20px 20px 0 0",
      boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
      fontFamily: "system-ui",
      maxHeight: "90vh",
      overflowY: "auto",
    }}>

      {/* Handle */}
      <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 0" }}>
        <div style={{ width:40, height:4, borderRadius:2, background:"#e5e7eb" }} />
      </div>

      {step === 0 ? (
        /* ── TELA 1: Banner inicial ── */
        <div style={{ padding:"16px 20px 28px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <img src="/icon-192.png" alt="ícone"
              style={{ width:52, height:52, borderRadius:12, flexShrink:0,
                       boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }} />
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:"#1B2D5B" }}>
                🎉 Novo ícone disponível!
              </div>
              <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>
                O CAA Neuro tem um visual novo. Reinstale para atualizar o ícone na tela inicial.
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <button onClick={() => setStep(1)} style={{
              flex:1, background:"#C76B4A", color:"white", border:"none",
              borderRadius:12, padding:"12px 0", fontWeight:700, fontSize:15,
              cursor:"pointer"
            }}>
              Ver como atualizar →
            </button>
            <button onClick={dismiss} style={{
              background:"#f3f4f6", color:"#6b7280", border:"none",
              borderRadius:12, padding:"12px 14px", fontWeight:600,
              fontSize:13, cursor:"pointer"
            }}>
              Agora não
            </button>
          </div>
        </div>

      ) : (
        /* ── TELA 2: Passo a passo ── */
        <div style={{ padding:"16px 20px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
            <button onClick={() => setStep(0)} style={{
              background:"none", border:"none", fontSize:20,
              cursor:"pointer", padding:"0 4px", color:"#6b7280"
            }}>←</button>
            <div style={{ fontWeight:800, fontSize:16, color:"#1B2D5B" }}>
              {os === "ios" ? "📱 Atualizar no iPhone/iPad" : "🤖 Atualizar no Android"}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:12,
                background:"#f9fafb", borderRadius:12, padding:"12px 14px"
              }}>
                <div style={{
                  minWidth:28, height:28, borderRadius:"50%",
                  background:"#1B2D5B", color:"white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, fontSize:13, flexShrink:0
                }}>{i + 1}</div>
                <div>
                  <span style={{ fontSize:18, marginRight:6 }}>{s.emoji}</span>
                  <span style={{ fontSize:14, color:"#374151", lineHeight:1.4 }}>{s.text}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={dismiss} style={{
            width:"100%", background:"#1B2D5B", color:"white", border:"none",
            borderRadius:12, padding:"13px 0", fontWeight:700, fontSize:15,
            cursor:"pointer"
          }}>
            Entendi, vou reinstalar ✓
          </button>
        </div>
      )}
    </div>
  );
}
