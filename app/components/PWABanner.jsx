"use client";
import { useState, useEffect } from "react";

export default function PWABanner() {
  const [show, setShow] = useState(false);
  const [os, setOs] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pwa-banner-dismissed")) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setOs("ios");
    else if (/Android/i.test(ua)) setOs("android");
    if (/iPhone|iPad|iPod|Android/i.test(ua)) setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-banner-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{background:"#071b2c",borderBottom:"2px solid #00885f",padding:"12px 20px",display:"flex",alignItems:"flex-start",gap:"14px",position:"sticky",top:0,zIndex:100}}>
      <div style={{fontSize:"28px",flexShrink:0}}>📲</div>
      <div style={{flex:1}}>
        <div style={{color:"white",fontWeight:"700",fontSize:"14px",marginBottom:"4px"}}>
          Instale o CAA Neuro no seu celular — use como app!
        </div>
        {os === "ios" && (
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:"13px",lineHeight:"1.6"}}>
            No <strong style={{color:"#4ec9a0"}}>Safari</strong>: toque em 
            <strong style={{color:"#4ec9a0"}}> compartilhar</strong> (□↑) → 
            <strong style={{color:"#4ec9a0"}}> "Adicionar à Tela de Início"</strong> → Adicionar
          </div>
        )}
        {os === "android" && (
          <div style={{color:"rgba(255,255,255,0.8)",fontSize:"13px",lineHeight:"1.6"}}>
            No <strong style={{color:"#4ec9a0"}}>Chrome</strong>: toque nos 
            <strong style={{color:"#4ec9a0"}}> três pontos</strong> (⋮) → 
            <strong style={{color:"#4ec9a0"}}> "Adicionar à tela inicial"</strong> → Adicionar
          </div>
        )}
      </div>
      <button onClick={dismiss} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:"20px",cursor:"pointer",flexShrink:0,padding:"0 4px"}}>✕</button>
    </div>
  );
}
