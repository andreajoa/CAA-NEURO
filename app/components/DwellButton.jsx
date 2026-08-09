"use client";
import { useRef, useState, useCallback, useEffect } from "react";

/**
 * DwellButton — botão com suporte a:
 * - Toque normal (onClick)
 * - Dwell time (hover por X ms seleciona automaticamente)
 * - Área de ativação ampliada (padding extra invisível)
 * - Feedback visual progressivo durante dwell
 *
 * Props:
 *   onActivate — callback quando ativado
 *   dwellMs    — tempo de dwell em ms (0 = desativado)
 *   style      — estilos do botão
 *   children   — conteúdo
 *   disabled   — desabilita
 */
export default function DwellButton({
  onActivate,
  dwellMs = 0,
  style = {},
  children,
  disabled = false,
  className = "",
  ariaLabel,
}) {
  const [progress, setProgress] = useState(0); // 0–100
  const [dwelling, setDwelling] = useState(false);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const activeRef = useRef(false);
  const activatedByDwellRef = useRef(false);
  const suppressClickTimerRef = useRef(null);

  const startDwell = useCallback(() => {
    if (!dwellMs || disabled || activeRef.current) return;
    activeRef.current = true;
    activatedByDwellRef.current = false;
    setDwelling(true);
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / dwellMs) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        activeRef.current = false;
        activatedByDwellRef.current = true;
        suppressClickTimerRef.current = setTimeout(() => {
          activatedByDwellRef.current = false;
        }, 750);
        setDwelling(false);
        setProgress(0);
        onActivate?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [dwellMs, disabled, onActivate]);

  const cancelDwell = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    activeRef.current = false;
    setDwelling(false);
    setProgress(0);
  }, []);

  useEffect(() => () => {
    cancelDwell();
    if (suppressClickTimerRef.current) clearTimeout(suppressClickTimerRef.current);
  }, [cancelDwell]);

  const baseStyle = {
    position: "relative",
    overflow: "hidden",
    cursor: disabled ? "default" : "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    // Área de ativação ampliada via padding invisível
    ...style,
  };

  return (
    <button
      className={className}
      aria-label={ariaLabel}
      style={baseStyle}
      disabled={disabled}
      onClick={() => {
        if (activatedByDwellRef.current) {
          activatedByDwellRef.current = false;
          if (suppressClickTimerRef.current) clearTimeout(suppressClickTimerRef.current);
          return;
        }
        onActivate?.();
      }}
      onPointerEnter={startDwell}
      onPointerDown={startDwell}
      onPointerLeave={cancelDwell}
      onPointerUp={cancelDwell}
      onPointerCancel={cancelDwell}
    >
      {/* Barra de progresso dwell */}
      {dwellMs > 0 && dwelling && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "4px",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #E8B4A8, #C76B4A)",
            transition: "none",
            borderRadius: "0 2px 2px 0",
            zIndex: 10,
          }}
        />
      )}
      {/* Overlay de progresso circular no centro */}
      {dwellMs > 0 && dwelling && progress > 5 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `rgba(78,201,160,${progress / 300})`,
            zIndex: 9,
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </button>
  );
}
