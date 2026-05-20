"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const PLANOS = [
  {
    id: "individual",
    nome: "Individual",
    preco: "R$35",
    desc: "Para profissionais autônomos",
    cor: "#00885f",
    features: ["1 profissional","Até 50 pacientes","Prancha CAA completa","Pranchoteca — 26 pranchas prontas","TTS Google 6 idiomas","Compartilhar por link","Relatório PDF","Backup automático"],
  },
  {
    id: "clinica",
    nome: "Clínica",
    preco: "R$149",
    desc: "Para clínicas e consultórios",
    cor: "#6366f1",
    destaque: true,
    features: ["Até 5 profissionais","Até 200 pacientes","Tudo do Individual","Pacientes compartilhados entre equipe","Pranchas compartilhadas","Admin vê todos os prontuários","Convidar membros por email","Painel da equipe"],
  },
  {
    id: "instituicao",
    nome: "Instituição",
    preco: "R$399",
    desc: "Para escolas, centros e prefeituras",
    cor: "#0891b2",
    features: ["Até 20 profissionais","Pacientes ilimitados","Tudo do Clínica","Relatório consolidado da equipe","Suporte prioritário","Contrato institucional","LGPD — DPA disponível","Onboarding dedicado"],
  },
];

export default function Planos() {
  const [loading, setLoading] = useState<string|null>(null);
  const [checkoutPlano, setCheckoutPlano] = useState<string|null>(null);
  const [clientSecret, setClientSecret] = useState<string|null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const checkoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => setStripeLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!clientSecret || !stripeLoaded || !containerRef.current) return;
    const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    if (checkoutRef.current) { checkoutRef.current.destroy(); checkoutRef.current = null; }
    const checkout = stripe.initEmbeddedCheckout({ clientSecret });
    checkoutRef.current = checkout;
    checkout.mount(containerRef.current);
    return () => { checkout.destroy(); checkoutRef.current = null; };
  }, [clientSecret, stripeLoaded]);

  async function assinar(planoId: string) {
    setLoading(planoId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoId, embedded: true }),
      });
      const d = await res.json();
      if (d.clientSecret) {
        setCheckoutPlano(planoId);
        setClientSecret(d.clientSecret);
        setTimeout(() => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else if (d.url) {
        window.location.href = d.url;
      } else {
        alert(d.error || "Erro ao iniciar checkout");
      }
    } catch { alert("Erro ao conectar com o servidor"); }
    setLoading(null);
  }

  function fecharCheckout() {
    if (checkoutRef.current) { checkoutRef.current.destroy(); checkoutRef.current = null; }
    setClientSecret(null);
    setCheckoutPlano(null);
  }

  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"system-ui"}}>
      <div style={{background:"#071b2c",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#4ec9a0",fontWeight:"800",fontSize:"20px"}}>CAA Neuro</span>
        <button onClick={() => router.push("/app")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.3)",color:"white",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>← Voltar</button>
      </div>

      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"48px 24px"}}>
        <div style={{textAlign:"center",marginBottom:"48px"}}>
          <h1 style={{fontSize:"36px",fontWeight:"900",color:"#071b2c",marginBottom:"12px"}}>Planos CAA Neuro</h1>
          <p style={{color:"#6b7280",fontSize:"16px"}}>Escolha o plano ideal para sua prática clínica</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"24px"}}>
          {PLANOS.map(p => (
            <div key={p.id} style={{background:"white",borderRadius:"20px",border:`2px solid ${checkoutPlano===p.id ? p.cor : p.destaque ? p.cor : "#e5e7eb"}`,padding:"32px",position:"relative",boxShadow: p.destaque ? `0 8px 32px ${p.cor}22` : "0 2px 8px rgba(0,0,0,0.06)",transition:"border 0.2s"}}>
              {p.destaque && (
                <div style={{position:"absolute",top:"-14px",left:"50%",transform:"translateX(-50%)",background:p.cor,color:"white",padding:"4px 20px",borderRadius:"999px",fontSize:"13px",fontWeight:"700",whiteSpace:"nowrap"}}>
                  Mais popular
                </div>
              )}
              <div style={{fontSize:"13px",fontWeight:"700",color:p.cor,marginBottom:"8px",textTransform:"uppercase",letterSpacing:"1px"}}>{p.nome}</div>
              <div style={{fontSize:"40px",fontWeight:"900",color:"#071b2c",marginBottom:"4px"}}>{p.preco}<span style={{fontSize:"16px",fontWeight:"500",color:"#6b7280"}}>/mês</span></div>
              <div style={{color:"#6b7280",fontSize:"14px",marginBottom:"24px"}}>{p.desc}</div>
              <button onClick={() => checkoutPlano===p.id ? fecharCheckout() : assinar(p.id)} disabled={loading===p.id}
                style={{width:"100%",padding:"14px",borderRadius:"12px",border:"none",background: checkoutPlano===p.id ? "#6b7280" : p.cor,color:"white",fontWeight:"700",fontSize:"15px",cursor:"pointer",marginBottom:"24px",opacity:loading===p.id?0.7:1,transition:"background 0.2s"}}>
                {loading===p.id ? "Aguarde..." : checkoutPlano===p.id ? "✕ Fechar" : "Assinar agora"}
              </button>
              <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:"10px"}}>
                {p.features.map((f,i) => (
                  <li key={i} style={{display:"flex",alignItems:"flex-start",gap:"10px",fontSize:"14px",color:"#374151"}}>
                    <span style={{color:p.cor,fontWeight:"700",flexShrink:0}}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {clientSecret && (
          <div ref={containerRef} style={{marginTop:"48px",background:"white",borderRadius:"20px",border:"2px solid #e5e7eb",padding:"32px",boxShadow:"0 8px 32px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"24px"}}>
              <h2 style={{fontSize:"20px",fontWeight:"800",color:"#071b2c",margin:0}}>
                Finalizar assinatura — {PLANOS.find(p=>p.id===checkoutPlano)?.nome}
              </h2>
              <button onClick={fecharCheckout} style={{background:"#f3f4f6",border:"none",borderRadius:"8px",padding:"8px 16px",cursor:"pointer",fontSize:"13px",color:"#374151"}}>✕ Cancelar</button>
            </div>
            <div id="stripe-checkout-container" />
          </div>
        )}

        <p style={{textAlign:"center",marginTop:"32px",color:"#9ca3af",fontSize:"13px"}}>
          Pagamento seguro via Stripe · Cancele quando quiser · Sem fidelidade
        </p>
      </div>
    </div>
  );
}
