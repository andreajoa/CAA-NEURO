"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlanosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [planoAtual, setPlanoAtual] = useState("gratuito");

  useEffect(() => {
    fetch("/api/plano").then(r => r.json()).then(d => setPlanoAtual(d.plano || "gratuito"));
  }, []);

  async function assinarPro() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Erro ao iniciar pagamento. Tente novamente.");
    } catch { alert("Erro de conexão."); }
    setLoading(false);
  }

  const planos = [
    {
      nome: "Gratuito",
      preco: "R$ 0",
      periodo: "para sempre",
      cor: "#e5e7eb",
      destaque: false,
      recursos: ["✅ Até 3 pacientes","✅ Cards da biblioteca padrão","✅ 45.000+ pictogramas ARASAAC","✅ Histórico de sessões","✅ Exportação CSV","❌ Geração de imagens com IA","❌ Análise clínica com IA","❌ Relatório PDF profissional","❌ Exportação Excel"],
      cta: planoAtual === "gratuito" ? "Plano atual" : "Fazer downgrade",
      action: null,
    },
    {
      nome: "Pro",
      preco: "R$ 35",
      periodo: "por mês",
      cor: "#00885f",
      destaque: true,
      recursos: ["✅ Pacientes ilimitados","✅ Cards da biblioteca padrão","✅ 45.000+ pictogramas ARASAAC","✅ Histórico de sessões","✅ Exportação CSV","✅ Geração de imagens com IA","✅ Análise clínica com IA","✅ Relatório PDF profissional","✅ Exportação Excel"],
      cta: planoAtual === "pro" ? "✅ Plano ativo" : loading ? "Processando..." : "Assinar Pro — R$ 35/mês",
      action: planoAtual !== "pro" ? assinarPro : null,
    },
    {
      nome: "Institucional",
      preco: "Sob consulta",
      periodo: "por instituição",
      cor: "#7c3aed",
      destaque: false,
      recursos: ["✅ Tudo do plano Pro","✅ Múltiplos profissionais","✅ Painel gestor centralizado","✅ Relatórios por unidade","✅ Onboarding dedicado","✅ Suporte prioritário","✅ Contrato e NF","✅ Conformidade LGPD completa"],
      cta: "Falar com a equipe",
      action: () => window.location.href = "mailto:contato@adhdautism.online?subject=Plano Institucional CAA Neuro",
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,Helvetica,sans-serif"}}>
      <nav style={{background:"#071b2c",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #00885f"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
        <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
        <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👥 Pacientes</a>
        <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px",marginLeft:"auto"}}>❓ Ajuda</a>
      </nav>

      <div style={{maxWidth:"960px",margin:"0 auto",padding:"48px 24px"}}>
        <div style={{textAlign:"center",marginBottom:"48px"}}>
          <h1 style={{fontSize:"36px",fontWeight:"900",color:"#071b2c",margin:"0 0 8px"}}>Escolha seu plano</h1>
          <p style={{color:"#6b7280",fontSize:"16px",margin:0}}>Comece grátis. Faça upgrade quando precisar de mais.</p>
          {planoAtual === "pro" && (
            <div style={{display:"inline-block",marginTop:"12px",background:"#f0fdf4",border:"1px solid #00885f",borderRadius:"10px",padding:"8px 20px",fontSize:"14px",color:"#00885f",fontWeight:"700"}}>
              ✅ Você está no plano Pro
            </div>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"24px"}}>
          {planos.map(p => (
            <div key={p.nome} style={{background:"white",borderRadius:"20px",border:`2px solid ${p.destaque ? p.cor : "#e5e7eb"}`,padding:"28px",display:"flex",flexDirection:"column",boxShadow:p.destaque?"0 8px 32px rgba(0,136,95,0.15)":"0 2px 8px rgba(0,0,0,0.06)",position:"relative"}}>
              {p.destaque && (
                <div style={{position:"absolute",top:"-14px",left:"50%",transform:"translateX(-50%)",background:"#00885f",color:"white",borderRadius:"999px",padding:"4px 20px",fontSize:"12px",fontWeight:"700",whiteSpace:"nowrap"}}>
                  ⭐ Mais popular
                </div>
              )}
              <div style={{marginBottom:"20px"}}>
                <div style={{fontSize:"20px",fontWeight:"900",color:"#071b2c",marginBottom:"4px"}}>{p.nome}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:"4px"}}>
                  <span style={{fontSize:"36px",fontWeight:"900",color:p.cor}}>{p.preco}</span>
                  <span style={{fontSize:"14px",color:"#9ca3af"}}>{p.periodo}</span>
                </div>
              </div>
              <ul style={{listStyle:"none",padding:0,margin:"0 0 24px",flex:1}}>
                {p.recursos.map(r => (
                  <li key={r} style={{fontSize:"14px",color:r.startsWith("❌")?"#9ca3af":"#374151",padding:"5px 0",borderBottom:"1px solid #f3f4f6"}}>{r}</li>
                ))}
              </ul>
              <button
                onClick={p.action || undefined}
                disabled={!p.action || loading}
                style={{width:"100%",padding:"14px",borderRadius:"12px",border:"none",cursor:p.action&&!loading?"pointer":"default",fontWeight:"700",fontSize:"15px",background:p.action&&!loading?p.cor:"#f3f4f6",color:p.action&&!loading?"white":"#9ca3af",transition:"opacity 0.2s"}}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <p style={{textAlign:"center",color:"#9ca3af",fontSize:"13px",marginTop:"32px"}}>
          Pagamento seguro via Stripe · Cancele quando quiser · Sem fidelidade
        </p>
      </div>
    </div>
  );
}
