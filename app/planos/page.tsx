"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const NAV = () => (
  <nav style={{background:"#071b2c",padding:"10px 20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",borderBottom:"2px solid #00885f"}}>
    <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"15px",marginRight:"8px"}}>CAA Neuro</span>
    <a href="/app" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>🏠 Prancha</a>
    <a href="/pacientes" style={{color:"white",textDecoration:"none",background:"rgba(255,255,255,0.1)",padding:"7px 14px",borderRadius:"8px",fontSize:"13px",fontWeight:"600"}}>👥 Pacientes</a>
    <a href="/suporte" style={{color:"rgba(255,255,255,0.6)",textDecoration:"none",fontSize:"12px",marginLeft:"auto"}}>❓ Ajuda</a>
  </nav>
);

export default function PlanosPage() {
  const [loading, setLoading] = useState(false);
  const [planoAtual, setPlanoAtual] = useState("gratuito");
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    fetch("/api/plano").then(r => r.json()).then(d => setPlanoAtual(d.plano || "gratuito"));
  }, []);

  async function abrirCheckout() {
    setLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedded: true }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowCheckout(true);
        setTimeout(() => {
          document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setCheckoutError(data.error || "Erro ao iniciar pagamento.");
      }
    } catch {
      setCheckoutError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  }

  const planos = [
    {
      nome: "Gratuito",
      preco: "R$ 0",
      periodo: "para sempre",
      cor: "#e5e7eb",
      destaque: false,
      recursos: [
        "✅ Até 3 pacientes",
        "✅ Cards da biblioteca padrão",
        "✅ 45.000+ pictogramas ARASAAC",
        "✅ Histórico de sessões",
        "✅ Exportação CSV",
        "❌ Geração de imagens com IA",
        "❌ Análise clínica com IA",
        "❌ Relatório PDF profissional",
        "❌ Exportação Excel",
      ],
      cta: planoAtual === "pro" ? "Fazer downgrade" : "Plano atual",
      action: null,
    },
    {
      nome: "Pro",
      preco: "R$ 35",
      periodo: "por mês",
      cor: "#00885f",
      destaque: true,
      recursos: [
        "✅ Pacientes ilimitados",
        "✅ Cards da biblioteca padrão",
        "✅ 45.000+ pictogramas ARASAAC",
        "✅ Histórico de sessões",
        "✅ Exportação CSV",
        "✅ Geração de imagens com IA",
        "✅ Análise clínica com IA",
        "✅ Relatório PDF profissional",
        "✅ Exportação Excel",
      ],
      cta: planoAtual === "pro" ? "✅ Plano ativo" : loading ? "Carregando..." : "Assinar Pro — R$ 35/mês",
      action: planoAtual !== "pro" ? abrirCheckout : null,
    },
    {
      nome: "Institucional",
      preco: "Sob consulta",
      periodo: "por instituição",
      cor: "#7c3aed",
      destaque: false,
      recursos: [
        "✅ Tudo do plano Pro",
        "✅ Múltiplos profissionais",
        "✅ Painel gestor centralizado",
        "✅ Relatórios por unidade",
        "✅ Onboarding dedicado",
        "✅ Suporte prioritário",
        "✅ Contrato e NF",
        "✅ Conformidade LGPD completa",
      ],
      cta: "Falar com a equipe",
      action: () => window.location.href = "mailto:contato@adhdautism.online?subject=Plano Institucional CAA Neuro",
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,Helvetica,sans-serif"}}>
      <NAV />

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

        {/* Cards de plano */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"24px",marginBottom:"40px"}}>
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
                style={{width:"100%",padding:"14px",borderRadius:"12px",border:"none",cursor:p.action&&!loading?"pointer":"default",fontWeight:"700",fontSize:"15px",background:p.action&&!loading?p.cor:"#f3f4f6",color:p.action&&!loading?"white":"#9ca3af",transition:"opacity 0.2s",opacity:loading&&p.nome==="Pro"?0.7:1}}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        {checkoutError && (
          <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"12px",padding:"16px",marginBottom:"24px",color:"#dc2626",textAlign:"center",fontSize:"14px"}}>
            {checkoutError}
          </div>
        )}

        {/* Checkout Embedded */}
        {showCheckout && clientSecret && (
          <div id="checkout-section" style={{background:"white",borderRadius:"20px",border:"2px solid #00885f",padding:"32px",boxShadow:"0 8px 40px rgba(0,136,95,0.15)",marginBottom:"40px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"24px"}}>
              <div>
                <h2 style={{fontSize:"20px",fontWeight:"900",color:"#071b2c",margin:"0 0 4px"}}>Finalizar assinatura Pro</h2>
                <p style={{margin:0,fontSize:"13px",color:"#6b7280"}}>Pagamento seguro via Stripe · Cancele quando quiser</p>
              </div>
              <button
                onClick={() => { setShowCheckout(false); setClientSecret(""); }}
                style={{background:"none",border:"1px solid #e5e7eb",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontSize:"13px",color:"#6b7280"}}
              >
                ✕ Fechar
              </button>
            </div>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}

        <p style={{textAlign:"center",color:"#9ca3af",fontSize:"13px"}}>
          Pagamento seguro via Stripe · Cancele quando quiser · Sem fidelidade
        </p>
      </div>
    </div>
  );
}
