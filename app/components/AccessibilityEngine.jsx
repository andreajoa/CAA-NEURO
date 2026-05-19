"use client";

/**
 * AccessibilityEngine — motor de acessibilidade adaptativo
 *
 * Exporta:
 *   useAccessibility(diagnostico) → { touchConfig, applyIntelliTouch, contrastFilter }
 *   AccessibilityPanel           → UI de configuração
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ── Perfis de diagnóstico → configurações de toque ──────────────────────────
export const DIAGNOSTICO_PROFILES = {
  tea: {
    label: "TEA (Autismo)",
    icon: "🧩",
    dwellMs: 0,
    touchTolerance: 20,      // px de tolerância ao redor do alvo
    minPressDuration: 80,    // ms mínimo de pressão para registrar
    debounceMs: 600,         // ms entre toques (evita duplo toque acidental)
    positionLocked: true,    // IntelliPosition — cards não mudam de lugar
    highContrast: false,
    largeFontScale: 1.0,
    scanningDefault: false,
  },
  paralisia_cerebral: {
    label: "Paralisia Cerebral",
    icon: "♿",
    dwellMs: 1500,           // dwell ativado por padrão
    touchTolerance: 40,
    minPressDuration: 0,
    debounceMs: 1200,
    positionLocked: true,
    highContrast: false,
    largeFontScale: 1.2,
    scanningDefault: true,
  },
  ela: {
    label: "ELA / ALS",
    icon: "🧠",
    dwellMs: 2000,
    touchTolerance: 50,
    minPressDuration: 0,
    debounceMs: 2000,
    positionLocked: true,
    highContrast: false,
    largeFontScale: 1.3,
    scanningDefault: true,
  },
  avc: {
    label: "AVC / AVE",
    icon: "🫀",
    dwellMs: 800,
    touchTolerance: 30,
    minPressDuration: 100,
    debounceMs: 800,
    positionLocked: false,
    highContrast: false,
    largeFontScale: 1.1,
    scanningDefault: false,
  },
  down: {
    label: "Síndrome de Down",
    icon: "💛",
    dwellMs: 0,
    touchTolerance: 25,
    minPressDuration: 100,
    debounceMs: 700,
    positionLocked: true,
    highContrast: false,
    largeFontScale: 1.1,
    scanningDefault: false,
  },
  baixa_visao: {
    label: "Baixa Visão",
    icon: "👁️",
    dwellMs: 0,
    touchTolerance: 15,
    minPressDuration: 80,
    debounceMs: 500,
    positionLocked: false,
    highContrast: true,      // IntelliVision ativado
    largeFontScale: 1.4,
    scanningDefault: false,
  },
  cognitivo: {
    label: "Comprometimento Cognitivo",
    icon: "🔷",
    dwellMs: 0,
    touchTolerance: 20,
    minPressDuration: 80,
    debounceMs: 800,
    positionLocked: true,    // IntelliPosition crítico
    highContrast: false,
    largeFontScale: 1.2,
    scanningDefault: false,
  },
  padrao: {
    label: "Padrão",
    icon: "⚙️",
    dwellMs: 0,
    touchTolerance: 0,
    minPressDuration: 0,
    debounceMs: 300,
    positionLocked: false,
    highContrast: false,
    largeFontScale: 1.0,
    scanningDefault: false,
  },
};

// ── Hook principal ───────────────────────────────────────────────────────────
export function useAccessibility(diagnosticoKey = "padrao") {
  const base = DIAGNOSTICO_PROFILES[diagnosticoKey] || DIAGNOSTICO_PROFILES.padrao;

  // Permite override manual sobre o base do diagnóstico
  const [overrides, setOverrides] = useState({});
  const config = { ...base, ...overrides };

  // IntelliTouch — debounce entre toques
  const lastTouchRef = useRef(0);

  const applyIntelliTouch = useCallback((fn) => {
    return (...args) => {
      const now = Date.now();
      if (now - lastTouchRef.current < config.debounceMs) return; // ignora toque muito rápido
      lastTouchRef.current = now;
      fn(...args);
    };
  }, [config.debounceMs]);

  // IntelliVision — filtro CSS de alto contraste para imagens
  const contrastFilter = config.highContrast
    ? "grayscale(1) contrast(2) brightness(1.1)"
    : "none";

  // Escala de fonte
  const fontScale = config.largeFontScale || 1.0;

  return {
    config,
    overrides,
    setOverrides,
    applyIntelliTouch,
    contrastFilter,
    fontScale,
    dwellMs: config.dwellMs,
    positionLocked: config.positionLocked,
    highContrast: config.highContrast,
  };
}

// ── Painel de configuração visual ────────────────────────────────────────────
export function AccessibilityPanel({ diagnostico, setDiagnostico, config, overrides, setOverrides, onClose }) {
  const [tab, setTab] = useState("diagnostico");

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"16px"
    }}>
      <div style={{
        background:"white", borderRadius:"20px", width:"100%", maxWidth:"520px",
        maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{background:"#071b2c", color:"white", padding:"20px 24px", borderRadius:"20px 20px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:"800", fontSize:"16px", color:"#4ec9a0"}}>♿ Acessibilidade Adaptativa</div>
            <div style={{fontSize:"12px", color:"rgba(255,255,255,0.6)", marginTop:"2px"}}>IntelliTouch · IntelliPosition · IntelliVision</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)", border:"none", color:"white", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", fontSize:"16px"}}>×</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex", borderBottom:"1px solid #e5e7eb"}}>
          {[["diagnostico","🏥 Diagnóstico"],["toque","👆 Toque"],["visual","👁️ Visual"]].map(([t,l]) => (
            <button key={t} onClick={()=>setTab(t)}
              style={{flex:1, padding:"12px", border:"none", background:"none", fontWeight:tab===t?"800":"400",
                color:tab===t?"#071b2c":"#6b7280", borderBottom:tab===t?"3px solid #4ec9a0":"3px solid transparent",
                cursor:"pointer", fontSize:"13px"}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{padding:"24px"}}>

          {/* Tab: Diagnóstico */}
          {tab === "diagnostico" && (
            <div>
              <p style={{fontSize:"13px", color:"#6b7280", marginBottom:"16px", marginTop:0}}>
                Selecione o diagnóstico para configurar automaticamente toque, posição e contraste.
              </p>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                {Object.entries(DIAGNOSTICO_PROFILES).map(([key, p]) => (
                  <button key={key} onClick={() => { setDiagnostico(key); setOverrides({}); }}
                    style={{
                      background: diagnostico===key ? "#071b2c" : "white",
                      color: diagnostico===key ? "white" : "#374151",
                      border: `2px solid ${diagnostico===key ? "#4ec9a0" : "#e5e7eb"}`,
                      borderRadius:"12px", padding:"12px", textAlign:"left", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:"10px"
                    }}>
                    <span style={{fontSize:"20px"}}>{p.icon}</span>
                    <span style={{fontSize:"13px", fontWeight:"700", lineHeight:"1.3"}}>{p.label}</span>
                  </button>
                ))}
              </div>
              {diagnostico !== "padrao" && (
                <div style={{marginTop:"16px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"12px", padding:"14px"}}>
                  <div style={{fontSize:"12px", fontWeight:"700", color:"#15803d", marginBottom:"8px"}}>✅ Configurado automaticamente para {DIAGNOSTICO_PROFILES[diagnostico]?.label}:</div>
                  <div style={{fontSize:"12px", color:"#374151", display:"flex", flexDirection:"column", gap:"4px"}}>
                    {config.dwellMs > 0 && <span>⏱ Dwell time: {config.dwellMs}ms</span>}
                    {config.touchTolerance > 0 && <span>🎯 Tolerância de toque: {config.touchTolerance}px</span>}
                    {config.positionLocked && <span>📌 IntelliPosition: cards fixos</span>}
                    {config.highContrast && <span>🔲 IntelliVision: alto contraste</span>}
                    {config.debounceMs > 300 && <span>🚫 Anti-duplo-toque: {config.debounceMs}ms</span>}
                    {config.largeFontScale > 1 && <span>🔤 Fonte ampliada: {config.largeFontScale}×</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Toque */}
          {tab === "toque" && (
            <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
              <div>
                <label style={{fontWeight:"700", fontSize:"13px", color:"#374151", display:"block", marginBottom:"8px"}}>
                  ⏱ Dwell time (seleção por tempo de hover)
                </label>
                <select value={overrides.dwellMs ?? config.dwellMs}
                  onChange={e => setOverrides(o => ({...o, dwellMs: Number(e.target.value)}))}
                  style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:"14px"}}>
                  <option value={0}>Desativado (toque direto)</option>
                  <option value={500}>0.5s</option>
                  <option value={800}>0.8s</option>
                  <option value={1500}>1.5s</option>
                  <option value={2000}>2.0s</option>
                  <option value={3000}>3.0s</option>
                  <option value={4000}>4.0s</option>
                </select>
              </div>
              <div>
                <label style={{fontWeight:"700", fontSize:"13px", color:"#374151", display:"block", marginBottom:"8px"}}>
                  🚫 Anti-duplo-toque (intervalo mínimo entre seleções)
                </label>
                <select value={overrides.debounceMs ?? config.debounceMs}
                  onChange={e => setOverrides(o => ({...o, debounceMs: Number(e.target.value)}))}
                  style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:"14px"}}>
                  <option value={300}>0.3s (padrão)</option>
                  <option value={500}>0.5s</option>
                  <option value={800}>0.8s</option>
                  <option value={1200}>1.2s</option>
                  <option value={2000}>2.0s</option>
                </select>
              </div>
              <div>
                <label style={{fontWeight:"700", fontSize:"13px", color:"#374151", display:"block", marginBottom:"8px"}}>
                  🎯 Área de ativação ampliada
                </label>
                <select value={overrides.touchTolerance ?? config.touchTolerance}
                  onChange={e => setOverrides(o => ({...o, touchTolerance: Number(e.target.value)}))}
                  style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:"14px"}}>
                  <option value={0}>Normal</option>
                  <option value={20}>+20px</option>
                  <option value={40}>+40px (recomendado PC)</option>
                  <option value={60}>+60px (recomendado PC severo)</option>
                </select>
              </div>
              <div>
                <label style={{display:"flex", alignItems:"center", gap:"12px", cursor:"pointer"}}>
                  <div onClick={() => setOverrides(o => ({...o, positionLocked: !(overrides.positionLocked ?? config.positionLocked)}))}
                    style={{width:"44px", height:"24px", borderRadius:"12px", flexShrink:0,
                      background:(overrides.positionLocked ?? config.positionLocked)?"#00885f":"#e5e7eb",
                      position:"relative", cursor:"pointer", transition:"background 0.2s"}}>
                    <div style={{position:"absolute", top:"3px",
                      left:(overrides.positionLocked ?? config.positionLocked)?"23px":"3px",
                      width:"18px", height:"18px", borderRadius:"50%", background:"white", transition:"left 0.2s"}} />
                  </div>
                  <div>
                    <div style={{fontWeight:"700", fontSize:"13px", color:"#374151"}}>📌 IntelliPosition — posição fixa de cards</div>
                    <div style={{fontSize:"12px", color:"#6b7280"}}>Cards não mudam de lugar entre sessões. Essencial para comprometimento cognitivo.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Tab: Visual */}
          {tab === "visual" && (
            <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>
              <div>
                <label style={{display:"flex", alignItems:"center", gap:"12px", cursor:"pointer"}}>
                  <div onClick={() => setOverrides(o => ({...o, highContrast: !(overrides.highContrast ?? config.highContrast)}))}
                    style={{width:"44px", height:"24px", borderRadius:"12px", flexShrink:0,
                      background:(overrides.highContrast ?? config.highContrast)?"#00885f":"#e5e7eb",
                      position:"relative", cursor:"pointer", transition:"background 0.2s"}}>
                    <div style={{position:"absolute", top:"3px",
                      left:(overrides.highContrast ?? config.highContrast)?"23px":"3px",
                      width:"18px", height:"18px", borderRadius:"50%", background:"white", transition:"left 0.2s"}} />
                  </div>
                  <div>
                    <div style={{fontWeight:"700", fontSize:"13px", color:"#374151"}}>🔲 IntelliVision — alto contraste nas imagens</div>
                    <div style={{fontSize:"12px", color:"#6b7280"}}>Converte imagens dos cards para preto e branco com alto contraste. Para baixa visão.</div>
                  </div>
                </label>
              </div>
              <div>
                <label style={{fontWeight:"700", fontSize:"13px", color:"#374151", display:"block", marginBottom:"8px"}}>
                  🔤 Tamanho do texto nos cards
                </label>
                <select value={overrides.largeFontScale ?? config.largeFontScale}
                  onChange={e => setOverrides(o => ({...o, largeFontScale: Number(e.target.value)}))}
                  style={{width:"100%", padding:"10px", borderRadius:"8px", border:"1px solid #e5e7eb", fontSize:"14px"}}>
                  <option value={0.85}>Pequeno (0.85×)</option>
                  <option value={1.0}>Normal (1×)</option>
                  <option value={1.2}>Grande (1.2×)</option>
                  <option value={1.4}>Muito grande (1.4×)</option>
                  <option value={1.6}>Máximo (1.6×)</option>
                </select>
              </div>
              {/* Preview */}
              <div style={{background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"12px", padding:"16px"}}>
                <div style={{fontSize:"12px", fontWeight:"700", color:"#6b7280", marginBottom:"12px"}}>PRÉVIA DO CARD:</div>
                <div style={{display:"flex", gap:"12px", justifyContent:"center"}}>
                  {["Água","Ajuda","Feliz"].map(label => (
                    <div key={label} style={{
                      width:"90px", border:"2px solid #e5e7eb", borderRadius:"12px",
                      padding:"8px", textAlign:"center", background:"white"
                    }}>
                      <div style={{
                        width:"60px", height:"60px", margin:"0 auto 6px",
                        background:"#f3f4f6", borderRadius:"8px", display:"flex",
                        alignItems:"center", justifyContent:"center",
                        filter:(overrides.highContrast ?? config.highContrast)
                          ? "grayscale(1) contrast(2)" : "none"
                      }}>
                        <span style={{fontSize:"28px"}}>🖼️</span>
                      </div>
                      <div style={{
                        fontSize:`${14 * ((overrides.largeFontScale ?? config.largeFontScale) || 1)}px`,
                        fontWeight:"700", color:"#071b2c"
                      }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{padding:"0 24px 24px", display:"flex", justifyContent:"flex-end"}}>
          <button onClick={onClose}
            style={{background:"#071b2c", color:"white", border:"none", borderRadius:"10px",
              padding:"12px 28px", fontWeight:"700", cursor:"pointer", fontSize:"14px"}}>
            ✅ Aplicar configurações
          </button>
        </div>
      </div>
    </div>
  );
}
