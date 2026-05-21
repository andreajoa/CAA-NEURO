"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href:"/profissional", icon:"🏠", label:"Para Profissionais", short:"Início" },
  { href:"/profissional/pranchas", icon:"🧠", label:"Pranchas Terapêuticas", short:"Pranchas" },
  { href:"/app",          icon:"🧩", label:"Prancha CAA",  short:"Prancha"     },
  { href:"/pacientes",    icon:"👥", label:"Pacientes",    short:"Pacientes"   },
  { href:"/agenda",       icon:"📅", label:"Agenda",       short:"Agenda"      },
  { href:"/pranchoteca",  icon:"📚", label:"Pranchoteca",  short:"Pranchas"    },
  { href:"/atividades",   icon:"🎯", label:"Atividades",   short:"Atividades"  },
  { href:"/paciente",     icon:"📲", label:"Modo Paciente",short:"Paciente"    },
  { href:"/perfil",       icon:"👤", label:"Perfil",       short:"Perfil"      },
  { href:"/planos",       icon:"⭐", label:"Planos",       short:"Planos"      },
];

export default function AppShell({ children }) {
  const path = usePathname();
  const [sideOpen, setSideOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Fechar sidebar ao navegar no mobile
  useEffect(() => { setSideOpen(false); }, [path]);

  const isActive = (href) => href === "/app" ? path === "/app" : path.startsWith(href);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f4f6f9", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* ── OVERLAY mobile ── */}
      {sideOpen && isMobile && (
        <div onClick={() => setSideOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:40, backdropFilter:"blur(2px)" }} />
      )}

      {/* ── SIDEBAR desktop + drawer mobile ── */}
      <aside style={{
        position: isMobile ? "fixed" : "sticky",
        top: 0, left: 0,
        height: "100vh",
        width: 220,
        background: "#071b2c",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        transform: isMobile && !sideOpen ? "translateX(-220px)" : "translateX(0)",
        transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontWeight:"900", fontSize:"20px", color:"#4ec9a0", letterSpacing:"-0.5px" }}>CAA Neuro</div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>Plataforma clínica</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, overflowY:"auto", padding:"10px 10px" }}>
          {NAV.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  padding:"10px 12px", borderRadius:"10px", marginBottom:"2px",
                  textDecoration:"none",
                  background: active ? "rgba(78,201,160,0.15)" : "transparent",
                  color: active ? "#4ec9a0" : "rgba(255,255,255,0.65)",
                  fontWeight: active ? "700" : "500",
                  fontSize:"14px",
                  transition:"all 0.15s",
                  borderLeft: active ? "3px solid #4ec9a0" : "3px solid transparent",
                }}>
                <span style={{ fontSize:"16px", width:"20px", textAlign:"center" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:"10px" }}>
          <UserButton afterSignOutUrl="/" />
          <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>Conta</span>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, paddingBottom: isMobile ? "70px" : 0 }}>

        {/* TopBar mobile */}
        {isMobile && (
          <header style={{
            position:"sticky", top:0, zIndex:30,
            background:"#071b2c", color:"white",
            padding:"0 16px",
            height:"54px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
          }}>
            <button onClick={() => setSideOpen(s => !s)}
              style={{ background:"none", border:"none", color:"white", fontSize:"22px", cursor:"pointer", padding:"6px", lineHeight:1 }}>
              ☰
            </button>
            <span style={{ fontWeight:"800", fontSize:"16px", color:"#4ec9a0" }}>CAA Neuro</span>
            <UserButton afterSignOutUrl="/" />
          </header>
        )}

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto" }}>
          {children}
        </main>
      </div>

      {/* ── BOTTOM NAV mobile ── */}
      {isMobile && (
        <nav style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:30,
          background:"#071b2c",
          display:"flex",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          height:"64px",
        }}>
          {NAV.slice(0,5).map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{
                  flex:1, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", gap:"2px",
                  textDecoration:"none",
                  color: active ? "#4ec9a0" : "rgba(255,255,255,0.45)",
                  fontSize:"10px", fontWeight: active ? "700" : "500",
                  background: active ? "rgba(78,201,160,0.1)" : "transparent",
                  transition:"all 0.15s",
                }}>
                <span style={{ fontSize:"18px" }}>{item.icon}</span>
                {item.short}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
