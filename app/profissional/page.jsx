"use client";
import AppShell from "../components/AppShell";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfissionalPage() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [plano, setPlano] = useState("gratuito");

  useEffect(() => {
    fetch("/api/admin-stats").then(r=>r.json()).then(d => setStats(d.totals)).catch(()=>{});
    fetch("/api/plano").then(r=>r.json()).then(d => setPlano(d.plano)).catch(()=>{});
  }, []);

  const nome = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Profissional";

  const acessos = [
    { href:"/profissional/pranchas", icon:"🧠", label:"Pranchas Terapêuticas", desc:"Crie pranchas personalizadas por paciente", cor:"#00885f" },
    { href:"/app",          icon:"🧩", label:"Prancha CAA",        desc:"Abrir prancha de comunicação padrão",     cor:"#059669" },
    { href:"/pacientes",    icon:"👥", label:"Pacientes",           desc:"Prontuários e histórico clínico",  cor:"#2563eb" },
    { href:"/agenda",       icon:"📅", label:"Agenda",              desc:"Agendamentos e sessões",           cor:"#7c3aed" },
    { href:"/pranchoteca",  icon:"📚", label:"Pranchoteca",         desc:"Pranchas prontas por especialistas", cor:"#d97706" },
    { href:"/atividades",   icon:"🎯", label:"Atividades",          desc:"Jogos terapêuticos para pacientes", cor:"#dc2626" },
    { href:"/paciente",     icon:"📲", label:"Modo Paciente",       desc:"Tela limpa para o paciente usar",  cor:"#059669" },
    { href:"/perfil",       icon:"👤", label:"Perfil profissional", desc:"CRFa, assinatura e dados clínicos", cor:"#374151" },
  ];

  const bloqueados = [
    { icon:"🤖", label:"Insights com IA",      desc:"Análise clínica automática das sessões",     plano:"Pro" },
    { icon:"📄", label:"Relatório PDF",         desc:"Relatório profissional para CFFa",           plano:"Pro" },
    { icon:"🖼️", label:"Gerar imagens com IA", desc:"Pictogramas únicos com fal.ai",              plano:"Pro" },
  ];

  const isPago = ["pro","clinica","instituicao","admin"].includes(plano);

  return (
    <AppShell>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 24px", fontFamily:"system-ui,sans-serif" }}>

        {/* Boas-vindas */}
        <div style={{ marginBottom:"32px" }}>
          <h1 style={{ fontSize:"26px", fontWeight:"800", color:"#071b2c", margin:"0 0 6px" }}>
            Olá, {nome} 👋
          </h1>
          <p style={{ color:"#6b7280", margin:0, fontSize:"15px" }}>
            Área criada para profissionais montarem pranchas, acompanharem pacientes e compartilharem recursos terapêuticos.
            {!isPago && <span style={{ marginLeft:"8px", background:"#fef9c3", color:"#854d0e", padding:"2px 10px", borderRadius:"20px", fontSize:"13px", fontWeight:"700" }}>Plano Gratuito</span>}
            {isPago && <span style={{ marginLeft:"8px", background:"#f0fdf4", color:"#166534", padding:"2px 10px", borderRadius:"20px", fontSize:"13px", fontWeight:"700" }}>✅ Plano {plano}</span>}
          </p>
        </div>

        {/* Stats rápidos */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"12px", marginBottom:"32px" }}>
            {[
              { label:"Pacientes", val:stats.patients||0, icon:"👥" },
              { label:"Sessões", val:stats.sessions||0, icon:"📋" },
              { label:"Cards", val:stats.cards||0, icon:"🧩" },
            ].map(s => (
              <div key={s.label} style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:"24px", marginBottom:"4px" }}>{s.icon}</div>
                <div style={{ fontSize:"26px", fontWeight:"800", color:"#071b2c" }}>{s.val}</div>
                <div style={{ fontSize:"12px", color:"#6b7280" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Acessos rápidos */}
        <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#071b2c", margin:"0 0 16px" }}>Acesso rápido</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"14px", marginBottom:"32px" }}>
          {acessos.map(a => (
            <Link key={a.href} href={a.href} style={{ textDecoration:"none" }}>
              <div style={{ background:"white", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"18px", display:"flex", alignItems:"center", gap:"14px", transition:"border-color 0.2s", cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor=a.cor}
                onMouseLeave={e => e.currentTarget.style.borderColor="#e5e7eb"}>
                <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:a.cor+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontWeight:"700", fontSize:"14px", color:"#071b2c" }}>{a.label}</div>
                  <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"2px" }}>{a.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Funcionalidades Pro */}
        <div style={{ background: isPago ? "#f0fdf4" : "#f9fafb", border:`1px solid ${isPago?"#bbf7d0":"#e5e7eb"}`, borderRadius:"16px", padding:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#071b2c", margin:0 }}>
              {isPago ? "✅ Funcionalidades Pro ativas" : "🔒 Funcionalidades Pro"}
            </h2>
            {!isPago && (
              <Link href="/planos" style={{ background:"#00885f", color:"white", padding:"8px 20px", borderRadius:"8px", textDecoration:"none", fontSize:"13px", fontWeight:"700" }}>
                Assinar →
              </Link>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"12px" }}>
            {bloqueados.map(b => (
              <div key={b.label} style={{ background:"white", borderRadius:"12px", border:"1px solid #e5e7eb", padding:"16px", opacity: isPago ? 1 : 0.7 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
                  <span style={{ fontSize:"20px" }}>{b.icon}</span>
                  <span style={{ fontWeight:"700", fontSize:"14px", color:"#071b2c" }}>{b.label}</span>
                  {!isPago && <span style={{ marginLeft:"auto", background:"#fef9c3", color:"#854d0e", padding:"2px 8px", borderRadius:"20px", fontSize:"10px", fontWeight:"700" }}>{b.plano}</span>}
                </div>
                <div style={{ fontSize:"12px", color:"#6b7280" }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
